const express = require('express');
const sql = require('mssql')
const app = express();
const dbConfig = {
    server: 'localhost',
    port: 1433,
    database: 'NPBookstore',
    user: 'npbookstore_user',
    password: 'Triangle15@38',
    options: {
        trustServerCertificate: true
    }
};

app.get('/', (req, res) => {
res.send('Welcome to the Book Category API');
});
app.get('/categories', (req, res) => {
res.json([
{ id: 1, name: 'Fiction' },
{ id: 2, name: 'Non-Fiction' },
{ id: 3, name: 'Biography' }
]);
});
app.get('/about', (req, res) => {
res.send('I like to play volleyball. I cycle alot. ');
});
app.get("/author", async (req, res) => {
    let connection;
    try{
        connection = await sql.connect(dbConfig)
        const sqlQuery = "SELECT AuthorID, Name FROM Author" ;
        const request = connection.request()
        const result =await request.query(sqlQuery);
        res.json(result.recordset);
    } catch(error){
        res.status(500).json({ error: "Database error"})
    } finally {
        if (connection){
            try{
                await connection.close();
            }catch (closeError) {
                console.error("Error closing connection: ", closeError);
            }
            
        } 
    }
});
app.get('/authors/:id', async(req,res)=>{
    const authorId = parseInt(req.params.id);
    if(isNaN(authorId)){
        return res.status(400).json({error:'Invalid id'});
    }
    let connection = await sql.connect (dbConfig)
    try{
        const request = connection.request();
        request.input('id', authorId);
        const sqlQuery = 'SELECT AuthorID, Name FROM Author WHERE AuthorID = @id';
        const result = await request.query(sqlQuery);
        if (result.recordset.length === 0) {
            return res.status (404).json({error: 'Not Found'})
        }
        res.status(200).json(result.recordset[0]);
    } catch (err){
        res.status(500).json({error: 'Database error'});
    }finally {
        if (connection) await connection.close();
    }

});
app.post('/authors', async (req, res) => {
    let connection;
    try{
        connection = await sql.connect(dbConfig);
        //const request = connection.request();
        //request.input('id', req.body.id);
        //request.input('name', req.body.name);
        //const sqlQuery = 'INSERT INTO Author (AuthorID, Name) OUTPUT INSERTED.* VALUES (@id, @name)';
        //const result = await request.query(sqlQuery);
        res.status(201).json(result.recordset[0]);
    } catch (err){
        res.status (500).json({error: 'Database error'});
    } finally {
        if (connection) await connection.close();
    }
})
app.get('/db-test', async (req, res) => {
try {
const pool = await sql.connect(dbConfig);
const result = await pool.request()
.query('SELECT COUNT(*) AS Total FROM Author');
await pool.close();
res.json({ connected: true, authors: result.recordset[0].Total });
} catch (err) {
res.status(500).json({ connected: false, error: err.message });
}
});
app.listen(3000, () => {
console.log('Listening on port 3000');
});
