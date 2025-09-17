import {CartModel, CartProductModel, ProductDoc} from "@shopverse/common";
import {Cart} from './cart.model';
import {CartProduct} from './cart-product.model';
import {AddProductToCartDto, CreateCartProductDto, RemoveProductfromCartDto, UpdateCartProductQuantityDto} from '../dtos/cart.dto';
import { populate } from "dotenv";
export class CartService {
    constructor(
        public cartModel: CartModel,
        public cartProductModel: CartProductModel

    ){}

    async findOneByUserId(userId: string) {
        return await this.cartModel.findOne({ user: userId})
    }
    async getCartProductById(productId: string, cartId: string) {
        return await this.cartProductModel.findOne({ product: productId, cart: cartId})
    }
    async createCart(userId: string) {
        const cart= new this.cartModel({
            user: userId,
        })
        return await cart.save();
    }
    async createCartProduct(createCartProductDto : CreateCartProductDto ){
        const cartProduct = new this.cartProductModel({
            cart: createCartProductDto .cartId,
            product: createCartProductDto .productId,
            quantity: createCartProductDto .quantity
        })
        return await cartProduct.save();
    }

    async isProductInCart(cartId: string, productId: string){
        return await !!( await this.cartProductModel.findOne({cartId, product: productId}))
    }
    async getCart(cartId: string) {
        return await this.cartModel.findOne({ _id: cartId })
    }

    async clearCart(userId: string, cartId: string) {
        return await this.cartModel.findOneAndUpdate({ _id: cartId, user: userId }, 
            { $set: { products: [], totalPrice: 0 } }, { new: true })
    }
    async removeProductfromCart(removeProductfromCartDto: RemoveProductfromCartDto){
        const { cartId, productId } = removeProductfromCartDto;
        const cartProduct = await this.cartProductModel.findOne({product: productId}).populate('product');
        if(!cartProduct || typeof cartProduct.product === 'string') return null;
        const deletedDoc = await this.cartProductModel.findOneAndRemove({_id: cartProduct._id});
        if(!deletedDoc) return null;
        return await this.cartModel.findOneAndUpdate({ _id: cartId },
            { $pull: {products: cartProduct._id}, 
            $inc: {totalPrice: -(cartProduct.product.price * cartProduct.quantity)}},{new: true}
        )
    }
    async updateProductQuantity(updateCartProductQuantityDto: UpdateCartProductQuantityDto){
        const { inc, amount } = updateCartProductQuantityDto.options;
        const { cartId, productId } = updateCartProductQuantityDto;
        const cartProduct = await this.cartProductModel.findOne({product: productId})
        if(!cartProduct) return null;

        if(cartProduct.quantity < amount && !inc){
            //remove product
            return await this.removeProductfromCart({cartId, productId});

        }
        const updatedCartProduct = await this.cartProductModel.findByIdAndUpdate(
            { _id: cartProduct._id },
            { $inc: { quantity: inc ? amount : -amount } },
            { new: true }
        ).populate('product');
        if (!updatedCartProduct || typeof updatedCartProduct.product === 'string') return null;
        const newPrice = inc
            ? updatedCartProduct.product.price * amount
            : -(updatedCartProduct.product.price * amount);
        const updatedCart = await this.cartModel.findByIdAndUpdate(
            { _id: cartId },
            { $inc: { totalPrice: newPrice } },
            { new: true }
        );

    }

    async addProduct(addProductToCartDto: AddProductToCartDto, product: ProductDoc){
        const { userId, quantity, productId } = addProductToCartDto;
        let cart = await this.findOneByUserId(userId);
        //If the product is already in the cart, update the quantity++
        const isProductInCart =cart && await this.isProductInCart(cart._id, productId)
        if(isProductInCart && cart) return this.updateProductQuantity({cartId: cart._id, productId, options: {inc: true, amount: quantity}});
        if(!cart) cart= await this.createCart(userId);
        const cartProduct = await this.createCartProduct({cartId: cart._id, productId, quantity});
        return await this.cartModel.findByIdAndUpdate({  _id: cart._id},
            {$push: {products: cartProduct}, $inc: {totalPrice: product.price* quantity}}, {new: true}
        )
    }
}
export const cartService = new CartService(Cart, CartProduct);