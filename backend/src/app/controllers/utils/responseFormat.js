const purchaseStatus = require('../enum/purchaseStatus')
function formatMyPurchases(data){
    var formatedValues = []
    var purchaseDescription = ''
    data.forEach(data => {
    
        data.dataValues.purchaseitems.forEach(item => {
            purchaseDescription += `${item.stock.product.name} ${item.quantity} uni /`
        })
        
        formatedValues.push({
            purchaseDescription,
            idPurchase:data.dataValues.idPurchase,
            createdAt:data.dataValues.createdAt,
            paymentOpened: data.purchasestatus.idPurchaseStatus == purchaseStatus["pagamento_em_aberto"].value,
            purchaseStatus: data.purchasestatus.status
        })

    })

    return formatedValues
}

function formatMyPurchaseDetails(data){
    var formatedValues = []
    var items = []

    data.dataValues.purchaseitems.forEach(item => {
        items.push({
            idProduct:item.stock.product.idProduct,
            name:item.stock.product.name,
            price:item.stock.product.price,
            idStock:item.stock.idStock,
            category:item.stock.product.category.category,
            size:item.stock.productsize.size,
            color:item.stock.productcolor.color,
            quantity:item.quantity
        })
    })

    formatedValues.push({
        items,
        // name:data.dataValues.stock.product.name,
        // price:data.dataValues.stock.product.price,
        // description:data.dataValues.stock.product.description,
        idPurchase:data.dataValues.idPurchase,
        createdAt:data.dataValues.createdAt,
        paymentOpened: data.purchasestatus.idPurchaseStatus == purchaseStatus["pagamento_em_aberto"].value ,
        purchaseStatus: data.purchasestatus.status
    })

  

    return formatedValues
}

function formatCategorysPath(categories){

    const getParent = (categories, idRootCategory) => {
        const parent = categories.filter(parent => parent.id === idRootCategory)
        return parent.length ? parent[0] : null
    }

    const categoriesWithPath = categories.map(category => {
        let path = category.name
        let parent = getParent(categories, category.idRootCategory)

        while(parent) {
            path = `${parent.name} > ${path}`
            parent = getParent(categories, parent.idRootCategory)
        }

        return { ...category, path }
    })

    categoriesWithPath.sort((a, b) => {
        if(a.path < b.path) return -1
        if(a.path > b.path) return 1
        return 0
    })

    return categoriesWithPath
}

function toTree(categories, tree){
   
        if(!tree) tree = categories.filter(c => !c.idRootCategory)
        tree = tree.map(parentNode => {
            const isChild = node => node.idRootCategory == parentNode.idCategory
            parentNode.children = toTree(categories, categories.filter(isChild))
            return parentNode
        })
        return tree
    
}
module.exports = {formatMyPurchases, formatMyPurchaseDetails, formatCategorysPath, toTree}        