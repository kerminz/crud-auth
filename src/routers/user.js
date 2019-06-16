const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }

})

router.post('/user/login', async (req, res) => {
    // look for credentials in database
        // middleware: hash password for comparison 
        // middleware 2: before sending user object to client, password and tokens should be removed from object!
    // on success: 1. generate Token and send entire user object and token to client

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(404).send(e)
    }

})
router.post('/user/logout', auth, async (req, res) => {
    // remove token from db
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/user/logoutAll', auth, async (req, res) => {
    // remove all tokens from db
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/user/me', auth, async (req, res) => {
    // returns user Object by fetching data from db
    // Auth needs to check permission by looking for valid token
    res.send(req.user)
})

router.patch('/user/me', auth, async (req, res) => {
    // define allowed operators
    const allowedUpdates = ['name', 'email', 'password']
    const updates = Object.keys(req.body)
    // check if updates are valid
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Operation not allowed!' })
    }
    // update user in db
    updates.forEach((update) => {
        req.user[update] = req.body[update]
    })
    await req.user.save()

    res.status(200).send(req.user)
})

router.delete('/user/me', auth, async (req, res) => {
    // remove user from db
    try {
        await req.user.remove()
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})


module.exports = router