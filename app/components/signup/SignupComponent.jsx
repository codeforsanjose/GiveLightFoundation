import * as React from 'react'
import Paper from 'material-ui/Paper';
import { registerUser, signupFacebook } from '../../api/api'
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import ProfileFormComponent from '../profile/ProfileFormComponent';

require('../sharedCss.css')
require('./SignupComponent.css')
require('../facebook/FacebookButton.css')

class SignupComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: '',
        }
    }

    responseFacebook = (response) => {
        this.setState({
            ...this.state,
            name: response.name,
            email: response.email,
        })
    }
    signupWithFacebook = (e) => {
        e.preventDefault()
        window.location = '/api/auth/facebook'
    }

    createUser = (user) => {
        delete user.checkboxInterests
        registerUser(user)
    }

    renderError = () => {
        if (this.state.error) {
            return <div className="sign-up-error">{this.state.error}</div>;
        }
    }

    render() {
        return (
            <Paper>
                <div className="p-b-33">
                    <div className="sign-up-panel-box p-l-30 p-r-30 p-t-10 p-b-9">
                        <div className="div-center div-separator">
                            <a href="#" onClick={this.signupWithFacebook} className="sign-up-fa-btn-face m-b-10">
                                <FontAwesome name="facebook-official" />Continue with Facebook
                            </a>
                        </div>
                        {this.renderError()}
                        <ProfileFormComponent formType={'signup'} submitHandle={this.createUser} submitLabel="Sign Up"/>
                        <div className="w-full text-center">
                            <span className="login-txt2 p-r-5">Already a volunteer?</span>
                            <Link className="login-sign-up login-txt2 bo1" to="/login">Sign in</Link>
                        </div>
                    </div>
                </div>
            </Paper>
        )
    }
}


export default SignupComponent
