const { MongoClient, GridFSBucket } = require("mongodb");
const fs = require("fs");
const path = require("path");

const url = "mongodb://localhost:27017";
const dbName = "MusicDataBase";

//funçao que cria///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function createDocument(db, document, filePath) {
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(path.basename(filePath));
        const fileStream = fs.createReadStream(filePath);

        fileStream.pipe(uploadStream)
            .on('error', (error) => {
                console.error('Erro ao fazer upload da imagem para o GridFS:', error);
                reject(error);
            })
            .on('finish', async () => {
                console.log('Imagem salva no GridFS com o _id:', uploadStream.id);
                
                // Adiciona o ID da imagem ao documento
                document.imageFileId = uploadStream.id;

                try {
                    const collection = db.collection("DataBaseMusic");
                    const result = await collection.insertOne(document);
                    console.log(`Documento inserido com o _id: ${result.insertedId}`);
                    resolve(result);
                } catch (error) {
                    console.error('Erro ao inserir o documento:', error);
                    reject(error);
                }
            });
    });
}

//funçao que le/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function readDocuments(db) {
    const collection = db.collection("DataBaseMusic");
    const documentos = await collection.find({}).toArray();
    console.log("Documentos encontrados:");
    console.log(documentos);
}
//funçao que faz update/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function updateDocument(db) {
    const collection = db.collection("DataBaseMusic");
    const result = await collection.updateOne(
        { nome: "Astolfo" },
        { $set: { idade: 36 } }
    );
    console.log(`Documentos atualizados: ${result.modifiedCount}`);
}

//funçao que deleta/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function deleteDocument(db) {
    const collection = db.collection("DataBaseMusic");

    // Encontre o documento para obter o file_id da imagem
    const document = await collection.findOne({ nome: "Astolfo" });

    if (document && document.imageFileId) {
        // Deleta a imagem do GridFS
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        await bucket.delete(document.imageFileId);
        console.log(`Imagem deletada com o _id: ${document.imageFileId}`);
    } else {
        console.log("Documento não encontrado ou sem imagem associada");
        return;
    }

    // Deleta o documento da coleção
    const result = await collection.deleteOne({ nome: "Astolfo" });
    console.log(`Documentos deletados: ${result.deletedCount}`);
}


async function main() {
    const client = new MongoClient(url, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Conectado ao servidor MongoDB");

        const db = client.db(dbName);

        const document = {
            nome: "Astolfo",
            idade: 30
        };

        await createDocument(db, document, 'JavaScript/Teste/mavis.gif');
        await readDocuments(db);
        await updateDocument(db);
        await readDocuments(db);
        //await deleteDocument(db);
        await readDocuments(db);
    } catch (erro) {
        console.error(erro + "<------------------------------------------------------------ Erro no catch ------------------------------------------------------------>");
    } finally {
        await client.close();
    }
}

main().catch(console.error);
