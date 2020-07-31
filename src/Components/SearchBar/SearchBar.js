import React from 'react';

import './SearchBar.css';

class SearchBar extends React.Component {

    constructor(props) {
        super(props);

        let term = '';
        const stateMatch = window.location.href.match(/state=([^&]*)/);
        if (stateMatch) {
            term = stateMatch[1]
        }
        
        this.state = {
            term: term
        }

        this.search = this.search.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
    }

    search() {
        this.props.onSearch(this.state.term);
    }

    handleTermChange(event) {
        this.setState({term: event.target.value});
    }
    
    componentDidMount() {
        this.search();
    }

    render() {
        return (
            <form className="SearchBar" onSubmit={ event => {event.preventDefault();} }>
                <input placeholder="Enter A Song, Album, or Artist" onChange={this.handleTermChange} value={this.state.term} />
                <button className="SearchButton" onClick={this.search} type='submit'>SEARCH</button>
            </form>
        )
    }
}

export default SearchBar;
