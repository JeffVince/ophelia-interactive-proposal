import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to data file
const dataFilePath = path.join(__dirname, 'src/data/data.json');

// Read data file with error logging
const readDataFile = () => {
  console.log(`Reading data from: ${dataFilePath}`);
  try {
    const exists = fs.existsSync(dataFilePath);
    if (!exists) {
      console.error(`Data file does not exist at: ${dataFilePath}`);
      return { phases: [] };
    }
    
    const data = fs.readFileSync(dataFilePath, 'utf8');
    console.log(`Data file read successfully (${data.length} bytes)`);
    try {
      const parsed = JSON.parse(data);
      console.log(`JSON parsed successfully. Phases count: ${parsed.phases?.length || 0}`);
      return parsed;
    } catch (parseError) {
      console.error(`Error parsing JSON data: ${parseError.message}`);
      return { phases: [] };
    }
  } catch (error) {
    console.error(`Error reading data file: ${error.message}`);
    return { phases: [] };
  }
};

// Write data file
const writeDataFile = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Data file written successfully to ${dataFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error writing data file: ${error.message}`);
    return false;
  }
};

// Routes
// Get all data
app.get('/api/data', (req, res) => {
  console.log('API Request: GET /api/data');
  const data = readDataFile();
  
  // Ensure phases have enabled property
  if (data.phases) {
    data.phases.forEach(phase => {
      if (phase.enabled === undefined) {
        phase.enabled = true; // Default to enabled
      }
    });
  }
  
  console.log(`Sending response with ${data.phases?.length || 0} phases`);
  res.json(data);
});

// Save all data
app.post('/api/data', (req, res) => {
  console.log('API Request: POST /api/data');
  const newData = req.body;
  
  if (!newData || typeof newData !== 'object') {
    console.error('Invalid data received');
    return res.status(400).json({ error: 'Invalid data format' });
  }
  
  // Write data to file
  if (writeDataFile(newData)) {
    console.log('Data saved successfully');
    res.json({ success: true });
  } else {
    console.error('Failed to write data file');
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Toggle phase enabled status
app.put('/api/phases/:phaseName/toggle', (req, res) => {
  const { phaseName } = req.params;
  const { enabled } = req.body;
  
  console.log(`API Request: PUT /api/phases/${phaseName}/toggle - Set to ${enabled}`);
  
  // Validate request
  if (enabled === undefined) {
    console.error('Missing enabled property in request body');
    return res.status(400).json({ error: 'Missing enabled property in request body' });
  }
  
  const data = readDataFile();
  
  // Try to find the phase by name (case insensitive)
  const phase = data.phases.find(p => 
    p.name.toLowerCase() === phaseName.toLowerCase()
  );
  
  if (!phase) {
    console.error(`Phase '${phaseName}' not found`);
    return res.status(404).json({ error: `Phase '${phaseName}' not found` });
  }
  
  // Update phase enabled status
  phase.enabled = enabled;
  console.log(`Updated phase '${phase.name}' to enabled=${enabled}`);
  
  // Write updated data to file
  if (writeDataFile(data)) {
    console.log('Changes saved to data file');
    res.json({ success: true, phase });
  } else {
    console.error('Failed to write data file');
    res.status(500).json({ error: 'Failed to write data file' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/data`);
  
  // Log data file information on startup
  const stats = fs.existsSync(dataFilePath) ? fs.statSync(dataFilePath) : null;
  if (stats) {
    console.log(`Data file exists: ${dataFilePath}`);
    console.log(`File size: ${stats.size} bytes`);
    console.log(`Last modified: ${stats.mtime}`);
  } else {
    console.error(`Data file does not exist: ${dataFilePath}`);
  }
}); 