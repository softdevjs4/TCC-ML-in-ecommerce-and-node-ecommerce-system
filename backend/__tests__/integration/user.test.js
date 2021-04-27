const request = require('supertest')
const {user} = require('../../src/app/models/')
const app = require('../../src/app')

describe('Product resgister validation', () => {
  
    it('Shold create address and associate a one user', async (done) => {

        const userWithoutAddress = await user.findOne({where:{idAddress:null}})
        const authUser = await request(app)
                        .post('/signin')
                        .send({email:userWithoutAddress.email,password:'12345'})
        thisUser = authUser.body.data


        const response = await request(app)
                        .post('/address')
                        .set('Authorization',`Bearer ${thisUser.token}`)
                        .send({
                                cep:"85200007",
                                city:"Pitanga",
                                state:"PR",
                                street:"Barao de capanema",
                                number:"4"
                            })
        const userWithAddress = await user.findOne({where:{idAddress:response.body.data.idAddress}})
        
        expect(userWithAddress.idAddress).toBe(response.body.data.idAddress)
        userWithAddress.update({idAddress:null})
        done()
    })
})