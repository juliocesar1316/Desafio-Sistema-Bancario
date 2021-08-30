const express = require('express');
const contas = require('./controladores/contas');
const servicos = require('./controladores/serviçosBancarios');
const app = require('./src/servidor');

const rotas = express();

rotas.get('/contas/', contas.consultaBancaria);
rotas.post('/contas', contas.criarConta);
rotas.put('/contas/:numeroConta/usuario', contas.atualizarUsuarioConta);
rotas.delete('/contas/:numeroConta', contas.excluirConta);

rotas.post('/transacoes/depositar', servicos.depositar);
rotas.post('/transacoes/sacar', servicos.sacar);
rotas.post('/transacoes/transferir',servicos.transferir);
rotas.get('/contas/saldo',servicos.saldo);
rotas.get('/contas/extrato', servicos.extrato);


module.exports = rotas;