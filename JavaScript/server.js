const express = require('express');
const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const url = "mongodb://localhost:27017";
const dbName = "MusicDataBase";

let db;
let client;

// Conecta ao MongoDB
async function connectToDatabase() {
    client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log("Conectado ao servidor MongoDB");
}

// Serve arquivos estáticos do diretório "public"
app.use(express.static(path.join(__dirname, 'public')));

// Recupera documentos e envia para a página web
app.get('/documents', async (req, res) => {
    try {
        const collection = db.collection("DataBaseMusic");
        const documents = await collection.find({}).toArray();
        
        res.json(documents);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Servir a imagem do GridFS
app.get('/image/:id', async (req, res) => {
    try {
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));

        res.setHeader('Content-Type', 'image/jpeg'); // Defina o tipo de conteúdo conforme necessário
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Página principal
app.get('/', async (req, res) => {
    const html = `
    <html>
        <head>
            <title>Documentos</title>
        </head>
        <body>
           
            <ul id="document-list"></ul>
            <script>
                fetch('/documents')
                    .then(response => response.json())
                    .then(data => {
                        const list = document.getElementById('document-list');
                        data.forEach(doc => {
                            const listItem = document.createElement('li');
                            listItem.innerHTML = \`Nome: \${doc.nome}, Idade: \${doc.idade}, <img src="/image/\${doc.imageFileId}" alt="imagem" />\`;
                            list.appendChild(listItem);
                        });
                    });
            </script>
        </body>
    </html>
    `;
    res.send(html);
});

// Conecta ao banco de dados e inicia o servidor
connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch(error => {
    console.error("Erro ao conectar ao MongoDB:", error);
});
