import { searchQuery } from "./utils/api-utlis";
import { NavigationBar } from "./ProfilePage";
import { useState } from "react";
import { Link } from "react-router-dom";
import './assets/css/searchPage.css'
function SearchPage(){
    const [query,setQuery] = useState('');
    const [projects,setProjects] = useState([]);
    const [people,setPeople] = useState([]);
    const handleSearch = async () => {
        const response = await searchQuery(query);
        const people_ = (Array.isArray(response.people) ? 
                         response.people : Object.values(response.people || {}));
        const projects_ = (Array.isArray(response.projects) ? 
                           response.projects : Object.values(response.projects || {}));
        console.log(people_);
        console.log(projects_);
        if(people_!==[])
            setPeople(people_);
        if(projects_!==[])
            setProjects(projects_); 
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
                <div className="displayResponse">{
                (Array.isArray(people) ? people : Object.values(people || {}))
                .map((val)=>{
                    const {id,username,email} = val;
                    return (
                        <div key={`person-${id}`}>
                            
                            
                        </div>
                    );
                })
                }</div>
                <div className="displayResponse">{
                (Array.isArray(projects) ? projects : Object.values(projects || {}))
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
            </div>
           </div>
    );
}
export default SearchPage;