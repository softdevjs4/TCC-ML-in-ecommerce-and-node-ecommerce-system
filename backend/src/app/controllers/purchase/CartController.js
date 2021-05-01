const {purchaseitem, purchase, stock} = require('../../models')
const httpStatus = require('../enum/httpStatus')
const {sequelizeOrGeneric} = require('../utils/errorFormat')
class CartController {

    async store(req, res){
        try{
            const data = req.body

            data.quantity < 0 ? res.status(400).send({status:false, msg:httpStatus["400"].value}) : null

            const productStock = await stock.findOne({where:{idStock:data.idStock}})
            
            let userCart = await purchase.findOne({where:{idUser:req.body.idUser, idPurchaseStatus:1}})
            


            if(!userCart){
                userCart = await purchase.create(data)
            }

            const oldPurchaseItem = await purchaseitem.findOne({where:{idPurchase:userCart.idPurchase, idStock:data.idStock}})
            
            if(oldPurchaseItem){
                if(data.quantity + oldPurchaseItem.quantity > productStock.quantity){
                    res.status(400).send({msg:'Desculpe, o valor adicionado ao carrinho excede o estoque', status:false})
                    return
                }
            }else{
                if(productStock.quantity < data.quantity){
                    return res.status(400).send({msg:'Desculpe, o valor adicionado ao carrinho excede o estoque', status:false})
                }
            }


            if(oldPurchaseItem){
                var response = await oldPurchaseItem.increment('quantity', {by:data.quantity});
            }else{
                data.idPurchase = userCart.idPurchase
                
                var response = await purchaseitem.create(data)
            }

            res.status(201).send({status:true,data:response})
        }
        catch(err){
            sequelizeOrGeneric(err, res)
        }
    }






    async deleteItemFromCart(req, res){
        try{
            !req.body.idPurchaseItem ? res.status(400).send({msg:httpStatus["400"].value, status:false}) : null
            const userCart = await purchase.findOne({where:{idUser:req.body.idUser, idPurchaseStatus:1}})
            
            if(userCart){
                await purchaseitem.destroy({where:{idPurchaseItem:req.body.idPurchaseItem, idPurchase:userCart.idPurchase}})
                res.status(200).send({status:true,msg:'Removido do carrinho'})
            }else{
                res.status(404).send({msg:'carrinho não encontrado', status:false, data:userCart})
            }
        }catch(err){
            res.status(500).send({message:err.msg})
            return 

        }

    }






    async update(req, res){
        try{
            // !req.body.idPurchaseItem ? res.status(400).send({msg:httpStatus["400"].value, status:false}) : null
            const result = await purchase.findOne({
                    attributes:[],
                    where:{idUser:req.body.idUser, idPurchaseStatus:1},
                    include:[
                    {
                        model:purchaseitem,
                        where:{idPurchaseItem:req.body.idPurchaseItem},
                        attributes:['quantity','idPurchaseItem'],
                        include:[{ 
                            model:stock,
                            attributes:['quantity']
                        }]
                    }
                    ]
                } 
                
                
            )
            const response = result.purchaseitems[0]    
            if(!response){
                res.status(400).send({status:false, msg:httpStatus["400"].value})
                return 
            }

            if(req.body.quantity > 0 ){
               
                if(response.quantity + req.body.quantity > response.stock.quantity){
                    res.status(400).send({msg:`Quantidade excede o estoque (${response.stock.quantity})`, status:false}) 
                    return 
                }
                var verb ="increment"
            }
            else{ 
                req.body.quantity  = req.body.quantity * (-1)
                
                if(response.quantity - req.body.quantity < 0){
                   
                    res.status(400).send({msg:'Você não pode comprar uma quantidade negativa de produtos', status:false})
                    return
                }
                var verb = "decrement"
            }
            const data = await purchaseitem[verb]('quantity', { by: req.body.quantity , where:{idPurchaseItem:response.idPurchaseItem}});
            return res.status(200).send({status:true,msg:httpStatus[200].value, data})
        }
        catch(err){
            sequelizeOrGeneric(err, res)
        }
    }




    async get(req, res){
        const {productcolor, productsize, product} = require('../../models')
        
            
            purchaseitem.findAll({
                attributes:['idPurchaseItem','quantity'],
                include: [{
                  model: purchase,
                  where: {idUser: req.body.idUser},
                  attributes:[]
                }, {
                    model:stock,
                    attributes:['quantity'],
                    include:[
                        {
                            model:productcolor,
                            attributes:['color']
                        },
                        {
                            model:productsize,
                            attributes:['size']
                        }
                        ,
                        {
                            model:product,
                            attributes:['name','price'] 
                        }
                    ]
                }
            ]
              }).then(response => {
                res.send({data:response})
              })
              .catch(err => sequelizeOrGeneric(err, res));        
    }
}

module.exports = new CartController()