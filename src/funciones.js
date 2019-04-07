const funcionalidades = (tipo) => {
    if(tipo === 'aspirante'){
        return {aspirante: true, salir: true}
    }else if (tipo === 'coordinador') {
        return {coordinador: true, salir: true}
    }else {
        return {interesado: true, login_registro: true}
    }
}

module.exports = {
    funcionalidades,
}