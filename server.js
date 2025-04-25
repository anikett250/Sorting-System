const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Create 'sorted' directory if it doesn't exist
const sortedFolder = path.join(__dirname, 'uploads', 'sorted');
if (!fs.existsSync(sortedFolder)) {
  fs.mkdirSync(sortedFolder);
}

// Set up the storage engine for multer (where to store the files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the folder based on the file extension
    let folder = 'others';  // Default folder for files that don't match extensions

    const ext = path.extname(file.originalname).toLowerCase();

    // Sort based on file extension
    if (ext === '.png') {
      folder = 'png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      folder = 'jpg';
    } else if (ext === '.pdf') {
      folder = 'pdf';
    }

    // Create the folder if it doesn't exist
    const folderPath = path.join(sortedFolder, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Set the destination to the folder
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // Rename the file to avoid conflicts
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve the index.html file explicitly if static files don't work for some reason
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle the file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded successfully: ${req.file.filename}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
