const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});