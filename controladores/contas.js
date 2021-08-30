const {contas} =  require('../src/bancodedados');

function validarConta(conta){
    if(!conta.nome){
        return {mensagem: "O campo Nome é obrigatorio"};
    }
    if(!conta.cpf){
        return {mensagem: "O campo cpf é obrigatorio"};
    }
    if(contas.find(x=>(x.usuario.cpf === conta.cpf && x.numero !== conta.numero))){
        return {mensagem: "Este CPF ja esta cadastrado"};
    }
    if(contas.find(x=>(x.usuario.email === conta.email && x.numero !== conta.numero))){
        return {mensagem: "Este E-Mail ja esta cadastrado"};
    }
    if(!conta.data_nascimento){
        return {mensagem: "O campo data_nascimento é obrigatorio"};
    }
    if(!conta.telefone){
        return {mensagem: "O campo telefone é obrigatorio"};
    }
    if(!conta.email){
        return {mensagem: "O campo email é obrigatorio"};
    }
    if(!conta.senha){
        return {mensagem: "O campo senha é obrigatorio"};
    }
}
    
function consultaBancaria (req,res){
    const senha = req.query.senha_banco;
    if(senha == '123'){
        res.json(contas);
    }
    else if(!senha || senha !== '123'){
        res.status(404);
        res.json({mensagem: "Senha invalida"});
    }
}
let id = contas.length;
function criarConta(req,res){
    
    const erro = validarConta(req.body);
    if(erro){
        res.status(404);
        res.json(erro);
        return;
    }
    id+=1;
    const novaConta = {
        numero: id,
        saldo: 0,
        usuario:{
            nome: req.body.nome,
            cpf: req.body.cpf,
            data_nascimento: req.body.data_nascimento,
            telefone: req.body.telefone,
            email: req.body.email,
            senha: req.body.senha,
        }
    }
    contas.push(novaConta);
    res.status(201);
    res.json(novaConta);
};
function atualizarUsuarioConta(req,res) {
    const erro = validarConta(req.body);
    if(erro){
        res.status(404);
        res.json(erro);
        return;
    }
    const conta = contas.find(x=> x.numero === Number(req.params.numeroConta));
    if(conta !== undefined){
        conta.usuario.nome = req.body.nome;
        conta.usuario.cpf = req.body.cpf;
        conta.usuario.data_nascimento = req.body.data_nascimento;
        conta.usuario.telefone = req.body.telefone;
        conta.usuario.email = req.body.email;
        conta.usuario.senha = req.body.senha;

        res.json({mensagem:"Conta atualizada com sucesso!"});
    }else{
        res.status(400);
        res.json({mensagem: `Usuario ${Number(req.params.numeroConta)} não encontrado`});
        return; 
    }
};
function excluirConta(req,res) {
    const conta = contas.find(x=> x.numero === Number(req.params.numeroConta));
    if(!conta){
        res.status(404);
        res.json({mensagem: `Instrutor ${req.params.numeroConta} não encontrado.`});
        return;
    }
    if(conta.saldo ==0 ){
        const findConta = contas.indexOf(conta);
        contas.splice(findConta,1);
        res.json({mensagem: "Conta excluída com sucesso!"});
    }else{
        res.json({mensagem: "A conta tem estar com saldo zerado"});
        return;
    }
   
}

module.exports = {
    consultaBancaria, 
    criarConta,
    atualizarUsuarioConta,
    excluirConta
}