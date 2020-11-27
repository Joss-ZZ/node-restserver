const express = require('express');
const { identity } = require('underscore');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// ===========================================
// Listar todos los Productos
// ===========================================
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

// ===========================================
// Listar producto por ID
// ===========================================
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, {})
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID ingresado no es válido'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });

});


// ===========================================
// Listar producto por ID
// ===========================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });

});



// ===========================================
// crear un nuevo producto
// ===========================================
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;
    let usuarioID = req.usuario._id;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: usuarioID
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ===========================================
// Actualizar un producto
// ===========================================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let body = req.body;

    let actualizaProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion
    }

    Producto.findByIdAndUpdate(id, actualizaProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });

});


// ===========================================
// Eliminar un producto
// ===========================================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    //     Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (err, productoDB) => {
    //         if (err) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 err
    //             });
    //         }
    //         if (!productoDB) {
    //             return res.status(400).json({
    //                 ok: false,
    //                 err
    //             });
    //         }
    //         res.json({
    //             ok: true,
    //             producto: productoDB
    //         });
    //     });

    //OTRO METODO MAS EFICAZ
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "ID no válido"
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado con éxito'
            });
        });
    });
});

module.exports = app;