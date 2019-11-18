var express = require('express');
var router = express.Router();
const sql = require('mssql')
const { poolPromise } = require('../db/db')

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise
        const result = await pool.request()
            .query('OPEN SYMMETRIC KEY SQLSymmetricKey DECRYPTION BY CERTIFICATE SelfSignedCertificate;\
                    SELECT Seller.ID, CONVERT (varchar, DecryptByKey(Seller.NIT)) AS NIT, Seller.FullName, Seller.Address, Seller.Phone, Seller.Role, Seller.Active, CommissionType.CommissionValue \
                    From Seller INNER JOIN Role ON Seller.Role = Role.Name INNER JOIN CommissionType ON Role.CommissionType = CommissionType.Name')
        res.json(result.recordset)
    } catch (err) {
        res.status(500)
        res.send(err.message)
    }
});

router.post('/', async (req, res) => {
    try {
        const pool = await poolPromise
        await pool.request()
            .input('nit', sql.VarBinary, new Buffer(req.body.nit))
            .input('fullName', sql.VarChar(255), req.body.fullName)
            .input('address', sql.VarChar(255), req.body.address)
            .input('phone', sql.Int, req.body.phone)
            .input('penaltyPercentage', sql.Float, req.body.penaltyPercentage)
            .input('role', sql.VarChar(50), req.body.role)
            .query('OPEN SYMMETRIC KEY SQLSymmetricKey DECRYPTION BY CERTIFICATE SelfSignedCertificate;\
                    INSERT INTO Seller (NIT, FullName, Address, Phone, PenaltyPercentage, Role, Active) \
                    VALUES (EncryptByKey(Key_GUID(\'SQLSymmetricKey\'), @nit), @fullName, @address, @phone, @penaltyPercentage, @role, 1)')
        res.send('Seller created successfully')
    } catch (err) {
        res.status(500)
        res.send(err)
    }
})

router.put('/', async (req, res) => {
    try {
        const pool = await poolPromise
        await pool.request()
            .input('id', sql.VarChar(50), req.body.id)
            .input('nit', sql.VarBinary, new Buffer(req.body.nit))
            .input('fullName', sql.VarChar(255), req.body.fullName)
            .input('address', sql.VarChar(255), req.body.address)
            .input('phone', sql.Int, req.body.phone)
            .input('role', sql.VarChar(50), req.body.role)
            .query('OPEN SYMMETRIC KEY SQLSymmetricKey DECRYPTION BY CERTIFICATE SelfSignedCertificate;\
                    UPDATE Seller SET NIT = EncryptByKey(Key_GUID(\'SQLSymmetricKey\'), @nit), FullName = @fullName, Address = @address, Phone = @phone, Role = @role WHERE ID = @id')
        res.send('Seller updated successfully')
    } catch (err) {
        res.status(500)
        res.send(err)
    }
})

router.delete('/', async (req, res) => {
    try {
        const pool = await poolPromise
        await pool.request()
            .input('id', sql.VarChar(50), req.body.id)
            .query('DELETE FROM Seller WHERE ID = @id')
        res.send('Seller deleted successfully')
    } catch (err) {
        res.status(500)
        res.send(err)
    }
})

router.put('/active', async (req, res) => {
    console.log(req.body.active)
    try {
        const pool = await poolPromise
        await pool.request()
            .input('id', sql.Int, req.body.id)
            .input('active', sql.Bit, req.body.active)
            .query('UPDATE Seller SET Active = @active WHERE ID = @id')
        res.send('Seller updated successfully')
    } catch (err) {
        res.status(500)
        res.send(err)
    }
})

module.exports = router;
