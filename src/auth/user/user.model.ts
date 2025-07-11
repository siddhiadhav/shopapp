import mongoose from "mongoose";
import {UserDoc, UserModel, AuthenticationService} from '@shopverse/common'

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
},{
    toJSON: {
        transform(doc,ret: any){
            ret.id= ret._id
            delete ret._id
            delete ret.password
        }
    }
})
schema.pre('save', async function(done) {
    const authenticationService = new AuthenticationService()
    if(this.isModified('password') || this.isNew) {
        const hashedPwd = await authenticationService.pwdToHash(this.get('password'));
        this.set('password', hashedPwd);
    }

    done()
})
/*This function:
Runs before saving a user document.
If the password is new or changed, it:
Hashes the password using AuthenticationService.
Replaces the plain password with the hashed one.
Ensures passwords are never stored in plain text in the database — a best practice for user security.
*/
export const User = mongoose.model<UserDoc, UserModel>('User', schema);