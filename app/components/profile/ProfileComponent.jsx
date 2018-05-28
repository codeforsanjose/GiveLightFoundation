import * as React from 'react'
import { getUser, updateUser } from '../../api/api'
import Paper from 'material-ui/Paper';
import avatarIcon from '../../../images/avatar.png';
import EmailIcon from 'material-ui/svg-icons/communication/email'
import CallIcon from 'material-ui/svg-icons/communication/call'
import MapIcon from 'material-ui/svg-icons/maps/map'
import EditIcon from 'material-ui/svg-icons/image/edit'
import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import ProfileFormComponent from './ProfileFormComponent';

import { blue300, lightBlue50 } from 'material-ui/styles/colors';

require('./ProfileComponent.css');

const styles = {
    chip: {
        margin: 4,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
};

class ProfileComponent extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            id: props.match.params.id,
            error: '',
            editView: false,
            user: {},
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.id != nextProps.match.params.id) {
            this.setState({
                id: nextProps.match.params.id,
            });
        }
    }

    componentWillMount() {
        getUser(this.state.id).then(response => {
            let checkboxInterests;

            if (response['error']) {
                console.log('Error in response :: ', response['error'])
                this.setState({
                    ...this.state,
                    error: response['error']
                });
            }
            else {
                this.setState({
                    ...this.state,
                    user: response.user
                });
            }
        }).catch(error => {
            console.log('Error :: ', error)
            this.setState({
                ...this.state,
                error: error
            });
        });
    }

    showProfileEditView = () => {
        this.setState({
            ...this.state,
            editView: true
        });
    };

    closeProfileEditView = () => {
        this.setState({
            ...this.state,
            editView: false,
        });
    }

    renderField = (icon, text) => {
        if (text) {
            return (
                <div className="centerAlign p-r-10">{icon}{text}</div>
            );
        }
    }

    renderError = () => {
        if (this.state.error) {
            return <div className="profile-get-error">{this.state.error}</div>;
        }
    }

    updateUser = (user) => {
        user._id = this.state.id
        updateUser(user).then(response => {
            console.log('Post update', response);
            this.setState({
                ...this.state,
                user: response,
                editView: false,
            })
        }).catch(error => {
            console.log('The error: ', error)
            this.setState({
                ...this.state,
                error: error,
            })
        })
    }


    render() {
        if (this.state.editView) {
            return (
                <Paper>
                    <div className="p-b-33">
                        <div className="profile-edit-panel-box p-l-30 p-r-30 p-t-10 p-b-9">
                            <ProfileFormComponent formType={'edit'} user={this.state.user} submitHandle={this.updateUser} cancelHandle={this.closeProfileEditView} submitLabel="Save" />
                        </div>
                    </div>
                </Paper>
            )
        }
        else {
            return (
                <Paper>
                    <div className="p-b-33 p-t-150">
                        <div className="profile-panel-box p-b-33">
                            {this.renderError()}
                            {this.state.user._id &&
                                <div className="p-t-70">
                                    <img src={avatarIcon} className="profile-img" />
                                    <div className="div-center profile-volunteer-name">{this.state.user.name}
                                        <IconButton color="primary" tooltip="Edit" tooltipPosition="bottom-right" onClick={(event) => this.showProfileEditView()}>
                                            <EditIcon color={blue300} />
                                        </IconButton>
                                    </div>
                                    <div className="div-center profile-volunteer-attrs p-b-9">
                                        {this.renderField(<EmailIcon className="profile-volunteer-icons" />, this.state.user.email)}
                                        {this.renderField(<CallIcon className="profile-volunteer-icons" />, this.state.user.phone)}
                                        {this.renderField(<MapIcon className="profile-volunteer-icons" />, this.state.user.country + ' - ' + this.state.user.region)}
                                    </div>
                                    <div className="div-center profile-skils p-t-13" style={styles.wrapper}>
                                        <div className="profile-skills-label">Interests:</div>
                                        {this.state.user.interests.map((intrst, index) => (<Chip key={index} backgroundColor={blue300} style={styles.chip}>{intrst}</Chip>))}
                                    </div>
                                    <div className="div-center profile-skils p-t-13" style={styles.wrapper}>
                                        <div className="profile-skills-label">Skills:</div>
                                        {this.state.user.skills.map((skills, index) => (<Chip key={index} backgroundColor={blue300} style={styles.chip}>{skills}</Chip>))}
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </Paper>
            )
        }
    }
}

export default ProfileComponent
