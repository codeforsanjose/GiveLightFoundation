import * as React from 'react'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField';
import { isValidEmail } from '../../../lib/validation.js'
import VolunteerInterestsCheckboxesComponent from '../commonComponents/VolunteerInterestsCheckboxesComponent'
import VolunteerSkillsInputComponent from '../commonComponents/SkillsInputComponent'

import { CountryDropdown, RegionDropdown } from 'react-country-region-selector-material-ui'

import { interests } from '../../models/interests'
import { lookupPhoneNumber } from '../../api/api'

require('../sharedCss.css')
require('./ProfileFormComponent.css')
require('../facebook/FacebookButton.css')

class ProfileFormComponent extends React.Component {
    constructor(props) {
        super(props)
        this.props = props
        this.initStateFromProps(props)
    }

    initStateFromProps = (props) => {
        const checkInter = interests.map(interest => ({
                interest: interest,
                checked: props.user && props.user.interests && props.user.interests.includes(interest)
            })
        )
        this.state = {
            name: props.user && props.user.name || '',
            email: props.user && props.user.email,
            country: props.user && props.user.country,
            region: props.user && props.user.region,
            phone: props.user && props.user.phone || '',
            passphrase: '',
            retypePassphrase: '',
            interests: props.user && props.user.interests,
            skills: props.user && props.user.skills,
            skillsInput: props.user && props.user.skills && props.user.skills.toString(),
            checkboxInterests: checkInter,
            errors: {
                name: '',
                email: '',
                phone: '',
                passphrase: '',
                retypePassphrase: '',
                country: '',
                region: '',
            }
        }
    }

    handleField = (fieldName, event) => {
        event.preventDefault()
        this.setState({
            ...this.state,
            [fieldName]: event.target.value
        })
    }

    handleCountry = (event, index, value) => {
        this.setState({
            ...this.state,
            country: value
        })
    }

    handleRegion = (event, index, value) => {
        this.setState({
            ...this.state,
            region: value
        })
    }

    handleSkillsInput = (event) => {
        event.preventDefault()
        if (event.target.value == "") {
            this.setState({
                ...this.state,
                skillsInput: "",
                skills: []
            })
        }
        else {
            this.setState({
                ...this.state,
                skillsInput: event.target.value,
                skills: event.target.value.split(/[,]+/)
            })
        }
    }

    handleCheckbox = (event, index, interest) => {
        var data = this.state.checkboxInterests
        data[index] = { interest: data[index].interest, checked: !data[index].checked }
        var volunteerInterests = []
        data.map(interestCheckbox => {
            if (interestCheckbox.checked) {
                volunteerInterests.push(interestCheckbox.interest)
            }
        })
        this.setState({
            ...this.state,
            checkboxInterests: data,
            interests: volunteerInterests
        })
    }

    validateState = () => {
        let errors = {
        }

        if (this.state.name.length === 0) {
            errors.name = 'Please enter your name.'
        }
        if (!isValidEmail(this.state.email)) {
            errors.email = 'Please enter a valid email.'
        }
        if (!this.state.country) {
            errors.country = 'Please select a country.'
        }
        if (!this.state.region) {
            errors.region = 'Please select a region.'
        }
        if (this.props.formType !== 'edit' && this.state.passphrase.length < 10) {
            errors.passphrase += 'Invalid Passphrase.'
        }
        if (this.props.formType !== 'edit' && !this.state.passphrase && !this.state.retypePassphrase && this.state.passphrase !== this.state.retypePassphrase) {
            errors.passphrase += 'Passphrases do not match.'
            errors.retypePassphrase = 'Passphrases do not match.'
        }
        // always havephone check last
        if (this.state.phone.length < 10) {
            errors.phone = 'Please enter a valid phone number with country code.'
        }
        return errors
    }

    displayPassphraseFields = () => {
        return (
            <div>
                <div><TextField type="password" name="passphrase" value={this.state.passphrase} floatingLabelText="Passphrase 10+ characters" errorText={this.state.errors.passphrase} onChange={(e) => this.handleField('passphrase', e)} /></div>
                <div><TextField type="password" name="retypePassphrase" value={this.state.retypePassphrase} floatingLabelText="Retype Passphrase" errorText={this.state.errors.passphrase} onChange={(e) => this.handleField('retypePassphrase', e)} /></div>
            </div>
        )
    }

    handleSubmit(e) {
        e.preventDefault()
        let errors = this.validateState()
        var user = this.state
        if (Object.keys(errors).length === 0) {
            delete user.errors
            delete user.checkboxInterests
            delete user.skillsInput
            lookupPhoneNumber(user.phone).then(response => {
                this.props.submitHandle(user)
            }).catch(error => {
                errors.phone += 'Invalid phone number'
                console.log(error)
                this.setState({
                    ...this.state,
                    errors: errors
                })
            })
        }
        else {
            lookupPhoneNumber(user.phone).then(response => {
                console.log('yes valid phone nuber')
                console.log(response)
            }).catch(error => {
                errors.phone += 'Invalid phone number'
                console.log(errors)
                this.setState({
                    ...this.state,
                    errors: errors
                })
            })
            
        }
    }

    render() {
        return (
            <form className="flex-sb flex-w">
                <div className="section">
                    <div>
                        <TextField type="text" name="name" value={this.state.name} floatingLabelText="Name" errorText={this.state.errors.name} onChange={(e) => this.handleField('name', e)} />
                    </div>
                    <div>
                        <TextField type="text" name="email" value={this.state.email} floatingLabelText="Email" errorText={this.state.errors.email} onChange={(e) => this.handleField('email', e)} />
                    </div>
                    <div>
                        <TextField type="number" floatingLabelText="Phone 15558971234" name="phone" value={this.state.phone} errorText={this.state.errors.phone} onChange={(e) => this.handleField('phone', e)} />
                    </div>
                    
                    {this.props.formType === 'signup' ? this.displayPassphraseFields(): null}
                    
                    <div className="countryRegionContainer">
                        {this.state.errors.country ? <div className="errorMsg">{this.state.errors.country}</div>: ''}
                        <CountryDropdown
                            value={this.state.country}
                            errorText={this.state.errors.country}
                            onChange={this.handleCountry}
                        />
                    </div>
                    <div className="countryRegionContainer">
                        {this.state.errors.region ? <div className="errorMsg">{this.state.errors.region}</div>: ''}
                        <RegionDropdown
                            country={this.state.country}
                            value={this.state.region}
                            errorText={this.state.errors.region}
                            onChange={this.handleRegion}
                        />
                    </div>
                </div>
                <div className={`section volunteerDetailsContainer`}>
                    <h3>Please choose at most 3:</h3>
                    <VolunteerInterestsCheckboxesComponent handleCheckbox={this.handleCheckbox} checkboxInterests={this.state.checkboxInterests} />
                    <VolunteerSkillsInputComponent handleSkillsInput={this.handleSkillsInput} skillsInput={this.state.skillsInput ? this.state.skillsInput : ''} />
                </div>
                <div className="btn-container m-t-10 div-center">
                    {this.props.cancelHandle && <button onClick={e => this.props.cancelHandle(e)} className="sign-up-panel-sign-up-btn btn-form btn">Cancel</button>}
                    <button onClick={e => this.handleSubmit(e)} className="sign-up-panel-sign-up-btn btn-form btn">{this.props.submitLabel}</button>
                </div>
            </form>
        )
    }
}


export default ProfileFormComponent
