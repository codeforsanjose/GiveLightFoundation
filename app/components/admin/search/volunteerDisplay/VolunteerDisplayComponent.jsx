import * as React from 'react'
import EmailIcon from 'material-ui/svg-icons/communication/email'
import CallIcon from 'material-ui/svg-icons/communication/call'
import MapIcon from 'material-ui/svg-icons/maps/map'
import Checkbox from 'material-ui/Checkbox'
import TextTruncate from 'react-ellipsis-text';
require('./VolunteerDisplayComponent.css');


class VolunteerDisplayComponent extends React.Component {
    constructor(props) {
        super(props)
        this.props = props
    }

    renderField = (icon, text) => {
        if (text) {
            return (
                <div className="centerAlign">{icon}{text}</div>
            );
        }
    }

    render() {
        let skills = this.props.volunteer.interests.join(', ');
        return (
            <div className="volunteerDisplayContainer">
                <div className="volunteerCheckbox">
                    <Checkbox
                        checked={this.props.volunteer.selected}
                        onCheck={(e) => this.props.handleVolunteerSelection(e, this.props.volunteer.index)}
                    />
                </div>
                <div className="volunteerIcon" ></div>
                <div className="volunteerInfo">
                    <div className="volunteerName p-l-5">{this.props.volunteer.name}</div>
                    <div className="volunteerData m-b-35 p-l-5">
                        <TextTruncate length={60} text={skills} />
                    </div>
                    <div className="volunteerData">
                        {this.renderField(<EmailIcon className="volunteerInfoSVGIcons"/>, this.props.volunteer.email)}
                        {this.renderField(<CallIcon className="volunteerInfoSVGIcons"/>, this.props.volunteer.phone)}
                        {this.renderField(<MapIcon className="volunteerInfoSVGIcons"/>, this.props.volunteer.country + ' - ' + this.props.volunteer.region)}
                    </div>
                </div>
            </div>
        )
    }
}

export default VolunteerDisplayComponent
