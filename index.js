const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); 

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjuyyb2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB! 🚀");

        const Project = client.db('potfolio').collection('projects'); 

        app.get('/api/projects', async (req, res) => {
            try {
                const projects = await Project.find().sort({ createdAt: -1 }).toArray(); 
                res.json(projects);
            } catch (error) {
                console.error("Error fetching projects:", error);
                res.status(500).json({ message: 'Error fetching projects', error: error.message });
            }
        });

        
        app.get('/api/projects/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const project = await Project.findOne({ _id: new ObjectId(id) }); 

                if (!project) return res.status(404).json({ message: 'Project not found' });
                res.json(project);
            } catch (error) {
                res.status(400).json({ message: 'Invalid Project ID format', error: error.message });
            }
        });

        app.post('/api/projects', async (req, res) => {
            try {
                const { title, description, technologies } = req.body;

                
                if (!title || !description || !technologies || technologies.length === 0) {
                     return res.status(400).json({ message: 'Title, description, and technologies are required.' });
                }

                const projectData = {
                    ...req.body,
                    createdAt: new Date(), 
                    technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim()).filter(t => t) // ফ্রন্টএন্ড থেকে আসা অ্যারে বা কমা-সেপারেটেড স্ট্রিং হ্যান্ডেল করা
                };
                
                
                const result = await Project.insertOne(projectData); 

                res.status(201).json({
                    _id: result.insertedId, 
                    ...projectData
                });

            } catch (error) {
                console.error('Error creating project:', error.message);
                res.status(500).json({ message: 'Error creating project (DB Issue)', error: error.message });
            }
        });


        app.put('/api/projects/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updateDoc = { $set: req.body };

                const result = await Project.updateOne(
                    { _id: new ObjectId(id) },
                    updateDoc
                );

                if (result.matchedCount === 0) return res.status(404).json({ message: 'Project not found' });

                const updatedProject = await Project.findOne({ _id: new ObjectId(id) });
                
                res.json(updatedProject);

            } catch (error) {
                res.status(400).json({ message: 'Error updating project', error: error.message });
            }
        });

       
        app.delete('/api/projects/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await Project.deleteOne({ _id: new ObjectId(id) }); 
                
                if (result.deletedCount === 0) return res.status(404).json({ message: 'Project not found' });
                
                res.json({ message: 'Project deleted successfully' });
            } catch (error) {
                res.status(400).json({ message: 'Invalid ID or DB error', error: error.message });
            }
        });

        app.post('/api/contact', async (req, res) => {
            try {
                const { name, email, message } = req.body;
                console.log('Contact form submission:', { name, email, message });
                res.json({ message: 'Message received successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error processing contact form', error: error.message });
            }
        });

    } finally {
        // ...
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('My portfolio fly in the sky ');
});

app.listen(port, () => {
    console.log(`job dao: ${port}`)
}); 