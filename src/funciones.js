import fs, { appendFile } from 'fs';
import express from 'express';

let listaCursos = []
let listaAspirantes = []


const funcionalidades = (tipo) => {
    if(tipo === 'aspirante'){
        return {aspirante: true, salir: true}
    }else if (tipo === 'coordinador') {
        return {coordinador: true, salir: true}
    }else {
        return {interesado: true, login_registro: true}
    }
}

const crearCurso = (curso) => {
    listarCursos()
    let cur = {
        nombre: curso.nombre,
        id: curso.id,
        descripcion: curso.descripcion,
        valor: curso.valor,
        modalidad: curso.modalidad,
        intensidad: curso.intensidad,
        inscritos: [],
        estado: 'disponible'
    }
    let duplicado = listaCursos.find(curso => curso.id == cur.id)
    let error = 0
    let mensaje = 'Registro creado con éxito'
    duplicado ? console.log('Ya existe otro curso con ese nombre') : console.log('Ok');
    duplicado ? ((error = 1) && (mensaje = 'Ya existe otro curso con id '+cur.id)): listaCursos.push(cur) && guardar()
    return {error, mensaje, cur}
}

const mostrarCursosDisponibles = () => {
    listarCursos()
    return listaCursos.filter(curso => curso.estado == 'disponible')
}

const listarCursos = () => {
    let data = '[]'
    try {
        data = fs.readFileSync('./cursos.json')
    } catch (err) {
        console.log('El archivo cursos.json no existe aún')
    }
    listaCursos = JSON.parse(data)
}

const listarAspirantes = () => {
    let data = '[]'
    try {
        data = fs.readFileSync('./aspirantes.json')
    } catch (err) {
        console.log('El archivo aspirantes.json no existe aún')
    }
    listaAspirantes = JSON.parse(data)
}
const guardar = () => {  
    let datos = JSON.stringify(listaCursos)
    fs.writeFileSync('cursos.json', datos, (err) => {
        err ? trow(err) : console.log('Archivo creado con exito')
    })
}

const guardarAspirantes = (params) => {
    let datos = JSON.stringify(listaAspirantes)
    fs.writeFileSync('aspirantes.json', datos, (err) => {
        err ? trow(err) : console.log('Archivo creado con exito')
    })
}
const cursosId = () => {
    listarCursos()
    return listaCursos    
}

const inscribirme = (aspirante) => {
    listarCursos()
    listarAspirantes()
    const res = crearAspirantes(aspirante)
    const cur1 = getCurso(aspirante.curso)
    const curso = {
        nombre: cur1.nombre,
        id: cur1.id,
        descripcion: cur1.descripcion,
        valor: cur1.valor,
        modalidad: cur1.modalidad,
        intensidad: cur1.intensidad,
    }
    let asp = {
        documento: aspirante.documento,
        nombre: aspirante.nombre,
        correo: aspirante.correo,
        telefono: aspirante.telefono,
    }
    
    let error = 0
    let mensaje = 'Curso inscrito con éxito'
    listaAspirantes.forEach((aspirante) => {
        aspirante.documento == asp.documento && aspirante.cursos.forEach(curso1 => {
            curso1.id == curso.id && ((error = 1) && (mensaje='Ya estas inscrito en este curso'))
        })
        error == 0 && aspirante.cursos.push(curso)
    })  
    error == 0 && listaCursos.forEach((c) => {
        c.id == curso.id && c.inscritos.push(asp)
    })
    guardar()
    guardarAspirantes()
    return {error, mensaje, asp}
}

const getCurso = (id) => {
    listarCursos()
    return listaCursos.find(curso => curso.id == id)
}

const crearAspirantes = (aspirante) => {
    listarAspirantes()
    let asp = {
        documento: aspirante.documento,
        nombre: aspirante.nombre,
        correo: aspirante.correo,
        telefono: aspirante.telefono,
        cursos: [],
    }
    let duplicado = listaAspirantes.find(aspirante => aspirante.documento == asp.documento)
    let error = 0
    let mensaje = 'Registro creado con éxito'
    duplicado ? console.log('Ya existe otro aspirante con ese documento') : console.log('Ok');
    duplicado ? ((error = 1) && (mensaje = 'Ya existe otro aspirante con ese documento '+asp.documento)): listaAspirantes.push(asp) && guardarAspirantes()
    return {error, mensaje, asp}
}

const cambiarEstado = (id) => {
    listarCursos()
    const curso = getCurso(id)
    listaCursos.forEach((curso) => {
        curso.id == id && (curso.estado = "no disponible")
    })
    guardar()
    return 'El curso '+curso.nombre+ ' ahora no esta disponible'
}

const eliminarAspCur = (idCurso, idAsp) => {
    listarAspirantes()
    listarCursos()
    listaAspirantes.forEach((aspirante) => {
        aspirante.documento == idAsp && aspirante.cursos.find(curso => curso.id == idCurso) && (aspirante.cursos = aspirante.cursos.filter(curso => curso.id !==idCurso))
    })
    listaCursos.forEach((curso) => {
        curso.id == idCurso && curso.inscritos.find(inscrito => inscrito.documento == idAsp) && (curso.inscritos = curso.inscritos.filter(inscrito => inscrito.documento !==idAsp))
    })
    guardar()
    guardarAspirantes()
}

module.exports = {
    crearCurso,
    mostrarCursosDisponibles,
    cursosId,
    inscribirme,
    cambiarEstado,
    eliminarAspCur,
    funcionalidades,
}