var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next )=> {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion 
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if( tiposValidos.indexOf( tipo )< 0 ){
        return   res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }


    if ( !req.files ){
            return   res.status(400).json({
                ok: false,
                mensaje: 'No selecciono nada',
                errors: { message: 'Debe de seleccionar una imagen' }
            });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionAchivo = nombreCortado[ nombreCortado.length -1 ];

    // Solo estas extensiones aceptamos
    var extensionValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extensionValidas.indexOf( extensionAchivo ) < 0 ){

        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionValidas.join(', ') }
        });

    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionAchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./upload/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err =>{

        if( err ){
            return   res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );
        
            // res.status(200).json({
            //     ok: true,
            //     mensaje: 'Arvhivo movido',
            //     extensionAchivo: extensionAchivo
            // });

    })


});


function subirPorTipo( tipo, id, nombreArchivo, res ){

    if( tipo === 'usuarios'){

        Usuario.findById( id, (err, usuario)=>{

            if( !usuario ){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe'}
                });
            }

            var pathViejo = './upload/usuarios/'+ usuario.img;

            // Si existe, elimina la imagen anterior
            if( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) =>{
            
                usuarioActualizado.password = ':)';

               return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de usuario actualizada',
                usuario: usuarioActualizado
            });

            });

        });


    }

    if( tipo === 'medicos'){
      
        Medico.findById( id, (err, medico)=>{

            if( !medico ){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe'}
                });
            }

            var pathViejo = './upload/medicos/'+ medico.img;

            // Si existe, elimina la imagen anterior
            if( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) =>{
            
               return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de medico actualizada',
                medico: medicoActualizado
            });

            });

        });
        
    }

    if( tipo === 'hospitales'){
 
        Hospital.findById(id, (err, hospital)=>{

            if( !hospital ){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe'}
                });
            }

            var pathViejo = './upload/hospitales/'+ hospital.img;

            // Si existe, elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink( pathViejo );
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) =>{
            
               return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de hospital actualizada',
                hospital: hospitalActualizado
            });

            });

        });
    }

}






module.exports = app;