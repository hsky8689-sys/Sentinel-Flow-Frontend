import { searchQuery } from "./utils/api-utlis";
import { NavigationBar } from "./ProfilePage";
import { useState } from "react";
import { Link } from "react-router-dom";
import './assets/css/searchPage.css';
const BASE_URL = import.meta.env.VITE_API_URL;
function SearchPage(){
    const [query,setQuery] = useState('');
    const [projects,setProjects] = useState([]);
    const [people,setPeople] = useState([]);
    const [hasSearched,setHasSearched] = useState(false);
    const handleSearch = async () => {
        const response = await searchQuery(query);
        const people_ = (Array.isArray(response.people) ? 
                         response.people : Object.values(response.people || {}));
        const projects_ = (Array.isArray(response.projects) ? 
                           response.projects : Object.values(response.projects || {}));
        setPeople(people_);
        setProjects(projects_);
        setHasSearched(true);
    }
    return(
        <div id='mainSearchDiv'>
            <NavigationBar/>
            <div id='searchArea'>
                    <input type="text"
                           id='searchInput'
                           placeholder="Search for something...."
                           value={query} 
                           onChange={(e)=>setQuery(e.target.value)}
                    />
                    <button id='searchBtn'
                            onClick={handleSearch}
                    >
                        Search
                    </button>
            </div>
                        <div id='responseArea'>
                <div className="displayResponse">
                    <h2 className="responseHeader">Projects</h2>
                    {hasSearched && projects.length === 0 && (
                        <p className="noResultsMessage">No projects found for this search</p>
                    )}
                    {(Array.isArray(projects) ? projects : Object.values(projects || {}))
                        .map((val)=>{
                            const {id,name,description} = val;
                            const slicedDescription = description.slice(0,500);
                            return (
                                <div key={`project-${id}`}
                                     className="projectData"
                                >
                                    <h2 className="projectLink">
                                        <Link to={`/project-page/${name}`}>
                                            {name}
                                        </Link>
                                    </h2>
                                    <span className="projectDescription"
                                          aria-readonly
                                    >
                                        {slicedDescription}
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
                <div className="displayResponse">
                    <h2 className="responseHeader">People</h2>
                    {hasSearched && people.length === 0 && (
                        <p className="noResultsMessage">No people found for this search</p>
                    )}
                    {(Array.isArray(people) ? people : Object.values(people || {}))
                        .map((val)=>{
                            const {id,username,profile_picture} = val;
                            return (
                                <div key={`person-${id}`} className="personResult">
                                    <div className="personAvatar">
                                        <img src={`${BASE_URL}${profile_picture}`} alt={username}/>
                                    </div>
                                    <Link to={`/user-profile/${username}`} className="personUsername">
                                        {username}
                                    </Link>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}
export default SearchPage;