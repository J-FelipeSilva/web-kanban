const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

//INICIALIZAÇÃO DO BANCO DE DADOS
const db = new sqlite3.Database('./kanban.db', (err) => {
    if (err) console.error("Erro ao abrir banco de dados", err);
});

//CRIAÇÃO DAS TABELAS (Normalização)
db.serialize(() => {
    // Tabela apenas para as colunas
    db.run(`CREATE TABLE IF NOT EXISTS colunas (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL
    )`);

    // Tabela para as tarefas, com uma referência para a qual coluna ela pertence
    db.run(`CREATE TABLE IF NOT EXISTS tarefas (
        id TEXT PRIMARY KEY,
        texto TEXT NOT NULL,
        coluna_id TEXT,
        FOREIGN KEY (coluna_id) REFERENCES colunas(id)
    )`);
});

//Rota para buscar o quadro Kanban inteiro para montar a tela
app.get('/api/kanban', (req, res) => {
    // Primeiro busca todas as colunas
    db.all("SELECT * FROM colunas", [], (err, colunas) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar colunas' });

        // Depois busca todas as tarefas
        db.all("SELECT * FROM tarefas", [], (err, tarefas) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar tarefas' });

            // Monta o formato JSON que o Front-end espera:
            // Cada coluna recebe um array "tarefas" filtrando apenas as tarefas que pertencem a ela
            const quadroFormatado = colunas.map(coluna => {
                return {
                    id: coluna.id,
                    titulo: coluna.titulo,
                    tarefas: tarefas
                        .filter(t => t.coluna_id === coluna.id)
                        .map(t => ({ id: t.id, texto: t.texto })) // Formata a tarefa
                };
            });

            res.json(quadroFormatado);
        });
    });
});

//Rota para CRIAR apenas UMA nova coluna
app.post('/api/kanban/columns', (req, res) => {
    const { titulo } = req.body;
    
    //Validação básica
    if (!titulo) return res.status(400).json({ error: 'Título obrigatório' });

    const id = `coluna-${Date.now()}`;
    
    //Insere apenas o novo registro, sem apagar o resto
    db.run("INSERT INTO colunas (id, titulo) VALUES (?, ?)", [id, titulo], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao salvar coluna no banco' });
        
        //Retorna a coluna criada com um array de tarefas vazio (pois acabou de nascer)
        res.status(201).json({ id, titulo, tarefas: [] });
    });
});

//Rota para CRIAR apenas UMA nova tarefa dentro de uma coluna
app.post('/api/kanban/tasks', (req, res) => {
    const { colunaId, texto } = req.body;
    
    //Validação básica
    if (!colunaId || !texto) return res.status(400).json({ error: 'colunaId e texto são obrigatórios' });

    const id = `tarefa-${Date.now()}`;

    //Verifica se a coluna realmente existe antes de adicionar a tarefa
    db.get("SELECT id FROM colunas WHERE id = ?", [colunaId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro ao consultar banco' });
        if (!row) return res.status(404).json({ error: 'Coluna não encontrada' });

        //Insere a tarefa no banco, vinculando ao ID da coluna
        db.run("INSERT INTO tarefas (id, texto, coluna_id) VALUES (?, ?, ?)", [id, texto, colunaId], function(err) {
            if (err) return res.status(500).json({ error: 'Erro ao salvar tarefa' });
            
            res.status(201).json({ id, texto });
        });
    });
});

//INICIALIZAÇÃO DO SERVIDOR
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor Kanban rodando em http://localhost:${port}`);
});
