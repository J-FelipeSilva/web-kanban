const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

//faz o Node.js servir o index.html e styles.css
app.use(express.static('.'));

const db = new sqlite3.Database('./kanban.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS colunas (id TEXT, titulo TEXT, tarefas TEXT)");
});

app.post('/salvar', (req, res) => {
    const dadosKanban = req.body;
    
    db.run("DELETE FROM colunas", () => {
        const stmt = db.prepare("INSERT INTO colunas VALUES (?, ?, ?)");
        dadosKanban.forEach(coluna => {
            stmt.run(coluna.id, coluna.titulo, JSON.stringify(coluna.tarefas));
        });
        stmt.finalize();
        res.send({ mensagem: 'Dados salvos com sucesso!' });
    });
});

//essa rota busca os dados no banco e devolve para o front-end
app.get('/carregar', (req, res) => {
    db.all("SELECT * FROM colunas", [], (err, rows) => {
        if (err) {
            res.status(500).send({ erro: 'Erro ao buscar dados' });
            return;
        }
        // Converte a string de tarefas de volta para o formato de array/JSON que o JS entende
        const dadosFormatados = rows.map(row => ({
            id: row.id,
            titulo: row.titulo,
            tarefas: JSON.parse(row.tarefas)
        }));
        res.send(dadosFormatados);
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
