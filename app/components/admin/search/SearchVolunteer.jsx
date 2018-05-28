import * as React from 'react';
import { exportUserData, getAllUsers, searchVolunteers, makeAdmin } from '../../../api/api';
import { interests } from '../../../models/interests';
import VolunteerInterestsCheckboxesComponent from '../../commonComponents/VolunteerInterestsCheckboxesComponent';
import VolunteerSkillsInputComponent from '../../commonComponents/SkillsInputComponent';
import VolunteerListComponent from './volunteerList/VolunteerListComponent';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector-material-ui';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

require('./SearchVolunteer.css')
require('../../sharedCss.css')

class SearchVolunteer extends React.Component {
    constructor(props) {
        super(props)
        const checkInterests = interests.map(interest => ({ interest: interest, checked: false }))
        this.state = {
            loadingScreenShow: false,
            checkboxInterests: checkInterests,
            searchQuery: {
                searchText: '',
                country: '',
                region: '',
                interests: [],
            },
            searchResult: {
                
            }
        }
    }

    handleField = (fieldName, event) => {
        event.preventDefault()
        let searchQuery = {
            ...this.state.searchQuery,
            [fieldName]: event.target.value
        }
        this.setState({ ...this.state, searchQuery: searchQuery })
    }

    handleSkillsInput = (event) => {
        event.preventDefault()
        let searchQuery = {
            ...this.state.searchQuery,
            skillsInput: event.target.value,
            skills: event.target.value.split(/\s*,\s*/),
        }
        if (searchQuery.skills && searchQuery.skills.length == 0 || searchQuery.skills[0] == '') {
            delete searchQuery['skills']
        }
        this.searchVolunteersHandler(searchQuery)
    }

    handleCountry = (event, index, value) => {
        event.preventDefault()
        let searchQuery = {
            ...this.state.searchQuery,
            country: value
        }
        this.searchVolunteersHandler(searchQuery)
        //this.setState({ ...this.state, searchQuery: searchQuery })
    }

    handleRegion = (event, index, value) => {
        event.preventDefault()
        let searchQuery = {
            ...this.state.searchQuery,
            region: value
        }
        this.searchVolunteersHandler(searchQuery)
        //this.setState({ ...this.state, searchQuery: searchQuery })
    }

    handleCheckbox = (event, index, interest) => {
        event.preventDefault()
        this.setState({ ...this.state, loadingScreenShow: true })
        var data = this.state.checkboxInterests
        data[index] = { interest: data[index].interest, checked: !data[index].checked }
        var volunteerInterests = []
        let interests = data.filter( interestCheckbox => {
            return interestCheckbox.checked
        }).map( interestCheckbox => {
            return interestCheckbox.interest
        })
        let searchQuery = {
            ...this.state.searchQuery,
            interests: interests
        }
        if (searchQuery.interests.length === 0) {
            delete searchQuery['interests']
        }
        this.searchVolunteersHandler(searchQuery)
    }

    handleSubmit = (event) => {
        event.preventDefault()
        this.searchVolunteersHandler(this.state.searchQuery)
    }

    searchVolunteersHandler = (searchQuery) => {
        this.showLoadingPanel();
        searchVolunteers(searchQuery).then( response => {
            this.setState({
                ...this.state,
                searchQuery: {
                    ...searchQuery
                },
                searchResult: response
            });
            this.hideLoadingPanel();
        }).catch(error => {
            alert(error)
            window.location.href = '/login'
        })
    }

    showLoadingPanel = () => {
        this.setState({ ...this.state, loadingScreenShow: true })
    }

    hideLoadingPanel = () => {
        this.setState({ ...this.state, loadingScreenShow: false })
    }

    renderLoadingPanel = () => {
        if (this.state.loadingScreenShow) {
            return (
                <div className="search-loading-status">
                    Searching, please wait...
                </div>
            )
        }
    }

    renderVolunteers = () => {
        if (this.state.searchResult && this.state.searchResult.result) {
            if (this.state.searchResult.result.length == 0) {
                return (
                    <div>No volunteers match your search query, try refining your query.</div>
                )
            }
            else {
                return (
                    <VolunteerListComponent volunteerList={this.state.searchResult.result} volunteerStats={this.state.searchResult.stats} timestamp={this.state.searchResult.timestamp}/>
                )
            }
        }
    }

    displaySearchTextFieldWithButton = () => {
        return (
            <div className="w-full">
                <div className="wrap-search-txt section p-r-110">
                    <TextField fullWidth type="text" name="searchText" value={this.state.searchQuery.searchText} floatingLabelText="Search" onChange={(e) => this.handleField('searchText', e)} />
                </div>
                <div className="search-btn-container m-t-27 section">
                    <button onClick={e => this.handleSubmit(e)} className="btn btn-form">Search</button>
                </div>
            </div>
        )
    }
    render() {
        return (
            <Paper>
                <div className="search-panel-box p-l-50 p-r-50 p-t-22">
                    <form className="flex-sb flex-w">
                        {true ? this.displaySearchTextFieldWithButton(): null}
                        <div className="w-full">
                            <div className="wrap-country-txt section p-r-110">
                                <CountryDropdown
                                    value={this.state.searchQuery.country}
                                    onChange={this.handleCountry} />
                            </div>
                            <div className="wrap-region-txt section">
                                <RegionDropdown
                                    country={this.state.searchQuery.country}
                                    value={this.state.searchQuery.region}
                                    onChange={this.handleRegion} />
                            </div>
                            <VolunteerSkillsInputComponent handleSkillsInput={this.handleSkillsInput} skillsInput={ this.state.searchQuery.skillsInput} />
                            <VolunteerInterestsCheckboxesComponent handleCheckbox={this.handleCheckbox} checkboxInterests={this.state.checkboxInterests} allowAll={true} />
                        </div>
                    </form>
                </div>
                <div className="search-panel-box p-l-50 p-r-50 p-t-22 p-b-33">
                        {this.renderLoadingPanel()}
                        { this.renderVolunteers() }
                </div>
            </Paper>
            )
    }
}

export default SearchVolunteer
