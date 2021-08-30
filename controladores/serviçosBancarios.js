const {contas,saques,transferencias,depositos} =  require('../src/bancodedados');
const {format} = require('date-fns');

function validarServico(servico){
    if(!servico.numero_conta){
        return {mensagem: "Campo numero_conta obrigatorio"};
    }
    if(!servico.valor){
        return {mensagem: "Campo valor obrigatorio"};
    }
    if(!contas.find(x=> x.numero === servico.numero_conta)){
        return {mensagem: "Numero da conta não encontrado!"};
    }
}
function validarSenha(senha){
    if(!senha.senha){
        return {mensagem: "Campo senha obrigatorio"};
    }
    const conta = contas.find(x=> x.numero === senha.numero_conta);
    if(!conta){
        return {mensagem: "Conta não encontrada!"};
    }
    if(conta.usuario.senha !== senha.senha){
        return {mensagem: "Senha Invalida!"}
    }
    if(senha.valor > conta.saldo){
        return {mensagem: "Saldo Indisponivel!"}
    }
}
function validarTransferencia(trans){
    if(!trans.numero_conta_origem){
        return {mensagem: "Campo numero_conta_origem obrigatorio"};
    }
    if(!trans.numero_conta_destino){
        return {mensagem: "Campo numero_conta_destino obrigatorio"};
    }
    if(!trans.senha_conta_origem){
        return {mensagem: "Campo senha_conta_origem obrigatorio"};
    }
    if(!trans.valor){
        return {mensagem: "Campo valor obrigatorio"};
    }
    const conta = contas.find(x=> x.numero === trans.numero_conta_origem)
    if(!conta){
        return {mensagem: "Conta de origem não encontrada"};
    }
    if(!contas.find(x=> x.numero === trans.numero_conta_destino)){
        return {mensagem: "Conta de destino não encontrada"};
    }
    if(conta.usuario.senha !== trans.senha_conta_origem){
        return {mensagem: "Senha Invalida!"};
    }
    if(trans.valor > conta.saldo){
        return {mensagem: "Saldo Indisponivel!"};
    }
}
function validarSaldoExtrato(saldo){
    if(!saldo.numero_conta){
        return {mensagem: "Parametro numero_conta obrigatorio"};
    }
    if(!saldo.senha){
        return{mensagem: "Parametro senha obrigatorio"};
    }
    const conta = contas.find(x=> x.numero === Number(saldo.numero_conta));
    if(!conta){
        return {mensagem: "Conta nao encontrada"};
    }
    if(conta.usuario.senha !== Number(saldo.senha)){
        return {mensagem:"Senha Invalida!"};
    }
}

function depositar(req,res) {
    if(contas.length == 0){
        res.status(400);
        res.json({mensagem: "Conta não cadastrada"});
        return;
    }
    const erro = validarServico(req.body);
    if(erro){
        res.status(404);
        res.json(erro);
        return;
    }
    const conta = contas.find(x=> x.numero === req.body.numero_conta);
    if(req.body.valor<=0){
        res.status(400);
        res.json({mensagem: "Só é permitido deposito acima de R$ 1,00"});
        return
    }else{
        conta.saldo = conta.saldo + req.body.valor;
        res.json({mensagem: "Depósito realizado com sucesso!"});
    }

    const data = format(new Date(),"yyyy-MM-dd HH:mm:ss");
    const deposito = {
        data: data,
        numero_conta: req.body.numero_conta,
        valor: req.body.valor
    }
    depositos.push(deposito);
};

function sacar(req,res) {
    if(contas.length == 0){
        res.status(400);
        res.json({mensagem: "Conta não cadastrada"});
        return;
    }
    const erroServico = validarServico(req.body);
    const erroSenha = validarSenha(req.body)
    if(erroServico){
        res.status(404);
        res.json(erroServico);
        return;
    }if(erroSenha){
        res.status(404);
        res.json(erroSenha);
        return;
    }
    const conta = contas.find(x=> x.numero === req.body.numero_conta);
    conta.saldo = conta.saldo - req.body.valor;
    res.json({mensagem: "Saque realizado com sucesso!"});
    
    const data = format(new Date(),"yyyy-MM-dd HH:mm:ss");
    const saque = {
        data: data,
        numero_conta: req.body.numero_conta,
        valor: req.body.valor
    }
    saques.push(saque);
};

function transferir(req,res) {
    if(contas.length == 0){
        res.status(400);
        res.json({mensagem: "Conta não cadastrada"});
        return;
    }
    const erro = validarTransferencia(req.body);
    if(erro){
        res.status(404);
        res.json(erro);
        return;
    }

    const contaOrigem = contas.find(x=> x.numero === req.body.numero_conta_origem);
    contaOrigem.saldo = contaOrigem.saldo - req.body.valor;
    const contaDestino = contas.find(x=> x.numero === req.body.numero_conta_destino);
    contaDestino.saldo = contaDestino.saldo + req.body.valor;
    res.json({mensagem: "Transferência realizada com sucesso!"});
    
    const data = format(new Date(),"yyyy-MM-dd HH:mm:ss");
    const transferencia={
        data: data,
        numero_conta_origem:req.body.numero_conta_origem,
        numero_conta_destino: req.body.numero_conta_destino,
        valor: req.body.valor
    }
    transferencias.push(transferencia);
};

function saldo(req,res) {
    const erro = validarSaldoExtrato(req.query);
    if(erro){
        res.status(404);
        res.json(erro);
        return;
    }
    const conta = contas.find(x=> x.numero === Number(req.query.numero_conta));
    res.json({Saldo: conta.saldo});
}

function extrato(req,res) {
    const erro = validarSaldoExtrato(req.query);
    if(erro){
        res.status(404);
        res.json(erro);
        return;
    }

    const deposito = depositos.filter(x=> x.numero_conta === Number(req.query.numero_conta));
    const saque = saques.filter(x=> x.numero_conta === Number(req.query.numero_conta));
    const transferenciasEnviadas = transferencias.filter(x=> x.numero_conta_origem === Number(req.query.numero_conta));
    const transferenciasRecebidas = transferencias.filter(x=> x.numero_conta_destino === Number(req.query.numero_conta));

    const saida = {
        depositos: deposito,
        saques: saque,
        transferenciasEnviadas:transferenciasEnviadas,
        transferenciasRecebidas:transferenciasRecebidas
    }
    res.json(saida)
}

module.exports={
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}