const NodeRSA = require('node-rsa');

const key = new NodeRSA({ b: 2048 });

const publicKey = key.exportKey('pkcs8-public-pem');
const privateKey = key.exportKey('pkcs8-private-pem');

console.log('=== 公钥 ===');
console.log(publicKey);
console.log('\n=== 私钥 ===');
console.log(privateKey);
console.log('\n请将公钥复制到 backend/.env 文件中的 RSA_PUBLIC_KEY 变量');
