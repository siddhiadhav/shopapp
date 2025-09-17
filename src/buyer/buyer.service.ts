import { ProductService, productService } from "src/seller/product/product.service";
import { CartService, cartService } from "./cart/cart.service";
import { AddProductToCartDto , UpdateCartProductQuantityDto, RemoveProductfromCartDto} from "./dtos/cart.dto";
import { BadRequestError , NotAuthorisedError} from "@shopverse/common";

export class BuyerService {
    constructor(
        public cartService: CartService,
        public productService: ProductService
    ){}
    async addProductToCart(addProductToCartDto: AddProductToCartDto) {
        const product= await this.productService.getOneById(addProductToCartDto.productId);
        if(!product) return new BadRequestError('Product not found');
        const cart=await this.cartService.addProduct(addProductToCartDto, product);
        if(!cart) return new Error('could not update the cart')
        return cart;
    }
    async updateCartProductQuantity(updateCartProductQuantityDto : UpdateCartProductQuantityDto){
        const { cartId, productId } = updateCartProductQuantityDto;
        const cartProduct = await this.cartService.getCartProductById(productId, cartId);
        if(!cartProduct) return new BadRequestError('Product not found in cart');
        const cart= await this.cartService.updateProductQuantity(updateCartProductQuantityDto);
        if(!cart) return new Error('could not update the cart')
        return cart;
    }
    async removeProductFromCart(removeProductFromCartDto: RemoveProductfromCartDto) {
        const { productId, cartId } = removeProductFromCartDto;
        const cartProduct = await this.cartService.getCartProductById(productId, cartId)
        if(!cartProduct) return new BadRequestError('product not found in cart');

        const cart = await this.cartService.removeProductfromCart(removeProductFromCartDto);
        if(!cart) return new Error('could not update the cart')
        return cart;
    }

    async getCart(cartId: string, userId: string) {
        const cart = await this.cartService.getCart(cartId);
        if(!cart) return new BadRequestError('cart not found');
        if(cart.user.toString() !== userId) return new NotAuthorisedError();

        return cart
    }
}

export const buyerService= new BuyerService(cartService, productService)