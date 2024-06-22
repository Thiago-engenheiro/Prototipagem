const express = require('express');
const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");
const path = require('path');
const multer = require('multer');
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

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve arquivos estáticos do diretório "public"
app.use(express.static(path.join('c:/Users/gusta/OneDrive/Área de Trabalho/Prototipagem/HTML/gerenciar.Musicas.html')));

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

        downloadStream.on('error', (error) => {
            console.error('Erro ao ler o arquivo do GridFS:', error);
            res.status(404).send('Arquivo não encontrado');
        });

        res.setHeader('Content-Type', 'image/jpeg'); // Defina o tipo de conteúdo conforme necessário
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Processa o upload do formulário
app.post('/upload', upload.single('musicImage'), async (req, res) => {
    try {
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        const uploadStream = bucket.openUploadStream(req.file.originalname);
        uploadStream.end(req.file.buffer);

        uploadStream.on('finish', async () => {
            const collection = db.collection("DataBaseMusic");
            const result = await collection.insertOne({
                nome: req.body.musicName,
                imageFileId: uploadStream.id
            });
            res.redirect('/');
        });

        uploadStream.on('error', (error) => {
            res.status(500).send(error);
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Serve a página HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join('c:/Users/gusta/OneDrive/Área de Trabalho/Prototipagem/HTML/gerenciar.Musicas.html'));
});

// Conecta ao banco de dados e inicia o servidor
connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch(error => {
    console.error("Erro ao conectar ao MongoDB:", error);
});
