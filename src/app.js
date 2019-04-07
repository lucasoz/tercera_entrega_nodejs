import express from 'express'
import path from 'path';
import hbs from 'hbs';
import helpers from './helpers';
import bodyParser from 'body-parser';
import funciones from './funciones';
import mongoose from 'mongoose'
import Usuario from './modelos/usuario'
import Curso from './modelos/curso'
import bcrypt from 'bcrypt'
import session from 'express-session'
import memoryStore from 'memorystore'
import _ from 'lodash'

const memorystore = memoryStore(session)

const app = express()

const dirPublic = path.join(__dirname, '../public')
const directoriopartials = path.join(__dirname,'../partials')

mongoose.connect('mongodb://localhost:27017/sistema_academico', {useNewUrlParser: true}, (err, resultado) => {
	if (err) {
		return console.log(err)
	}
	console.log('conectado a mongodb');
});

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new memorystore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: '$ec4+p4ssw04d'
}))

app.use(express.static(dirPublic))
hbs.registerPartials(directoriopartials)
app.use(bodyParser.urlencoded({extended: false}))

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render('index', {
        funcion: 'Página principal',
        nombre: req.session.nombre,
        permisos: funciones.funcionalidades(req.session.tipo)
    })
})

// rutas todos

app.get('/registro', (req, res) => {
    res.render('registro', {
        funcion : "Registrarse", 
        permisos: funciones.funcionalidades(req.session.tipo)
    })
})

app.post('/registro', (req, res) => {
    console.log(req.body);
    let usuario = new Usuario({
        documento: req.body.documento,
        nombre: req.body.nombre,
        correo: req.body.correo,
        telefono: req.body.telefono,
        password: bcrypt.hashSync(req.body.password, 10),
    })

    usuario.save((err, resultado) => {
		if(err){       
            console.log(err);
                 
            let error_message = err.errors.documento ? err.errors.documento.message : err.errors.correo ? err.errors.correo.message : ''
		    return res.render('registro', {
                funcion : "Registrarse", 
                hayerror: true,		
                error: error_message,
                permisos: funciones.funcionalidades(req.session.tipo)
			})
		}
		res.redirect('/listar-cursos')
	})
})

app.get('/login', (req, res) => {
    res.render('login', {
        funcion : "Iniciar sesión", 
        permisos: funciones.funcionalidades(req.session.tipo)
    })
})

app.post('/login', (req, res) => {
    Usuario.findOne({correo: req.body.correo}, (err , respuesta) => {
        if(err){
            return console.log(err)
        }

        if(!respuesta){
            return res.render('login', {
                permisos: funciones.funcionalidades(req.session.tipo),
                funcion : "Iniciar sesión", 
                error: "Contraseña incorrecta"
            })
        }

        if(!bcrypt.compareSync(req.body.password, respuesta.password)){
            return res.render('login', {
                funcion : "Iniciar sesión", 
                error: "Contraseña incorrecta",
                permisos: funciones.funcionalidades(req.session.tipo)
            })
        }

        req.session.usuario = respuesta._id
        req.session.tipo = respuesta.tipo
        req.session.nombre = respuesta.nombre
        console.log(req.session);
        
        res.render('index', {
            funcion: 'Página principal',
            nombre: req.session.nombre,
            permisos: funciones.funcionalidades(req.session.tipo)
        })

    })
})

// rutas coordinador

app.get('/crear-cursos', (req, res) => {
    res.render('crearCursos', {
        funcion : "Crear un curso", 
        permisos: funciones.funcionalidades(req.session.tipo)
    })
})

app.post('/crear-cursos', (req, res) => { 
    let curso = new Curso({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        valor: req.body.valor,
        modalidad: req.body.modalidad,
        intensidad: req.body.intensidad,
    })

    curso.save((err, resultado) => {
		if(err){            
            let error_message = err.errors.modalidad ? err.errors.modalidad.message : err.errors.nombre ? err.errors.nombre.message : ''
		    return res.render('crearCursos', {
                funcion : "Crear un curso", 
                hayerror: true,		
                error: error_message,
                curso: curso,
                permisos: funciones.funcionalidades(req.session.tipo)
			})
		}
		res.redirect('/listar-cursos')
	})

})

app.get('/ver-inscritos', (req, res) => {
    const id = req.query.id
    Curso.findOneAndUpdate({_id: id}, {estado: 'no disponible'}, (err, respuesta) => {
        if(err){
            return console.log(err)
        }
        let mensaje = ''
        respuesta && (mensaje = 'Curso actualizado con éxito')
        Curso.find({estado: 'disponible'}).populate('inscritos',{documento: 1, correo:1, nombre:1, telefono:1}).exec((err, cursos) => {
            if (err) {
                return console.log('err')
            }
            return res.render('verInscritos', {
                funcion : "Ver inscritos", 
                cursos: cursos,
                mensaje: mensaje,
                permisos: funciones.funcionalidades(req.session.tipo)
            })
        })
    })    
})


app.get('/eliminar-personas',(req, res) => {
    const idCurso = req.query.idCurso
    const idAsp = req.query.idAsp
    Curso.findByIdAndUpdate(idCurso, {$pull : {inscritos : idAsp}}, (err, respuesta) => {
        if(err){
            return console.log(err)
        }
        Usuario.findByIdAndUpdate(idAsp, {$pull : {cursos : idCurso}}, (err, resultado) => {
            if(err){
                return console.log(err)
            }
            Curso.find({estado: 'disponible'}).populate('inscritos',{documento: 1, correo:1, nombre:1, telefono:1}).exec((err, cursos) => {
                if (err) {
                    return console.log('err')
                }
                let mensaje = ''
                resultado && respuesta && (mensaje = "Aspirante eliminado con éxito")

                return res.render('eliminarPersonas', {
                    funcion : "Eliminar personas", 
                    cursos: cursos,
                    mensaje,
                    permisos: funciones.funcionalidades(req.session.tipo)
                })
            })
        })

    })    
})

// rutas aspirantes
app.get('/inscribirme',(req, res) => {
    const id = req.session.usuario
    if(!id){
       return res.redirect('/login') 
    }
    Usuario.findById(id, {cursos: 1}, (err, usuario) => {
        if(err){
            return console.log(err);
        }
        Curso.find(_.isEmpty(usuario.cursos) ? {estado: 'disponible'} : {$and : [{estado: 'disponible'}, {_id: {$nin: usuario.cursos}}]},{nombre: 1}).exec((err, respuesta) => {
            if (err) {
                return console.log(err)
            }
    
            res.render('inscribirme', {
                funcion : "Inscripción a un curso", 
                cursos: respuesta,
                permisos: funciones.funcionalidades(req.session.tipo)
            })
        })
    })   
})


app.post('/inscribirme',(req, res) => {
    const cursoId = req.body.curso
    const userId = req.session.usuario
    
    Curso.findById(cursoId, (err, curso) => {
        if (err) {
            return console.log(err)
        }
        curso && Curso.updateOne({_id: cursoId}, {$push : {inscritos : userId}}, (err, respuesta) => {
            if (err) {
                return console.log(err)
            }
            Usuario.updateOne({_id: userId},{$push: {cursos: cursoId}},(err, resultado) => {
                if (err) {
                    return console.log(err)
                }
            })

        })
        res.redirect('/inscribirme')
    })

    

})


//rutas interesados
app.get('/listar-cursos',(req, res) => {
    Curso.find({estado: 'disponible'}).exec((err, respuesta) => {
        if (err) {
			return console.log('err')
		}
		res.render('listarCursos', {
            funcion : "Lista de cursos", 
            cursos: respuesta,
            permisos: funciones.funcionalidades(req.session.tipo)
        })
    })
})

app.get('*', (req, res) => {
    res.render('error', {
        estudiante: 'error',
        funcion: 'Error',
        permisos: funciones.funcionalidades(req.session.tipo)
    })
})


app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000')
})
