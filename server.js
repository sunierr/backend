const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

app.use(cors());
app.use(express.json());

app.use('/encrypt', express.static(path.join(__dirname, './dist')));

app.get('/encrypt', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

let encryptedRecords = [];
const MAX_RECORDS = 10;

const publicKeyPem = process.env.RSA_PUBLIC_KEY;

if (!publicKeyPem) {
  console.error('错误：请在 .env 文件中设置 RSA_PUBLIC_KEY');
  process.exit(1);
}

app.get('/api/public-key', (req, res) => {
  res.json({ publicKey: publicKeyPem });
});

app.get('/api/records', (req, res) => {
  res.json({ records: encryptedRecords });
});

app.post('/api/records', (req, res) => {
  try {
    const { encryptedText } = req.body;
    
    if (!encryptedText || typeof encryptedText !== 'string') {
      return res.status(400).json({ error: '请提供有效的加密文本' });
    }

    if (encryptedRecords.length >= MAX_RECORDS) {
      return res.status(400).json({ error: '已达到最大记录数限制（10条）' });
    }
    
    const record = {
      id: Date.now().toString(),
      encryptedText: encryptedText,
      createdAt: new Date().toISOString()
    };

    encryptedRecords.push(record);

    res.json({ 
      success: true, 
      record,
      message: '保存成功' 
    });
  } catch (error) {
    console.error('保存错误：', error);
    res.status(500).json({ error: '保存失败' });
  }
});

app.delete('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = encryptedRecords.length;
    
    encryptedRecords = encryptedRecords.filter(record => record.id !== id);
    
    if (encryptedRecords.length === initialLength) {
      return res.status(404).json({ error: '记录未找到' });
    }

    res.json({ 
      success: true, 
      message: '删除成功' 
    });
  } catch (error) {
    console.error('删除错误：', error);
    res.status(500).json({ error: '删除失败' });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

app.use((req, res) => {
  res.redirect('/encrypt');
});
