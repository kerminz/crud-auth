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
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(404).send(e)
    }

})
router.post('/user/logout', auth, async (req, res) => {
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
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get('/user/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/user/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Operation not allowed!' })
    }
    updates.forEach((update) => {
        req.user[update] = req.body[update]
    })
    await req.user.save()

    res.status(200).send(req.user)
})

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})


module.exports = router