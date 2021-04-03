import React, { useState } from "react";
import "./App.css";

interface GistForkedUserType {
    owner: {
        login: string;
        avatar_url: string;
    };
}
interface GistForkedUserApiResponseType {
    value: {
        owner: {
            login: string;
            avatar_url: string;
        };
    };
}
interface GistFileType {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    size: number;
}
interface GistDataType {
    id: string;
    forks_url: string;
    description: string;
    files: {
        [key: string]: GistFileType;
    };
    forkedUsers?: GistForkedUserType[];
}

function App() {
    const [gistList, setGistList] = useState<GistDataType[]>([]);
    const [userName, setUserName] = useState<string>("");

    const handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    };

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetch(`https://api.github.com/users/${userName}/gists`)
            .then((response: Response) => response.json())
            .then((data: GistDataType[]) => {
                console.log("data: ", data);
                setGistList(data);
                fetchForkedUsersList(data);
            })
            .catch((errorResponse: Error) => {
                console.log("errorResponse: ", errorResponse);
            });
    };

    const handleFormReset = () => {
        setGistList([]);
        setUserName("");
    };

    const fetchForkedUsersList = (data: GistDataType[]) => {
        const forkedUsersApiPromises: any[] = [];
        data.forEach(({ id, forks_url }) => {
            forkedUsersApiPromises.push(fetch(forks_url));
        });
        Promise.all(forkedUsersApiPromises)
            .then((responses) => Promise.all(responses.map((result) => result.json())))
            .then((forkedUsers) => {
                const gistWithForkedUsers = forkedUsers.map((users, index) => {
                    const usersCount = users.length;
                    const latestForkedUsers = usersCount && usersCount > 3 ? users.slice(0, 3) : users;

                    return {
                        ...data[index],
                        forkedUsers: latestForkedUsers,
                    };
                });
                setGistList(gistWithForkedUsers);
            });
    };

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={handleFormSubmit} onReset={handleFormReset}>
                    <input
                        type="text"
                        name="userName"
                        className="user-name"
                        value={userName}
                        placeholder="Enter user name to search"
                        onChange={handleUserNameChange}
                    />
                    <button type="submit">Search</button>
                    <button type="reset">Reset</button>
                </form>
            </header>
            <main className="app-body">
                {gistList.map(({ id, files, description, forkedUsers }) => (
                    <article key={id}>
                        <h3>{id}</h3>
                        <p>{description}</p>
                        <section>
                            <ul>
                                {Object.keys(files).map((filename) => (
                                    <li key={filename}>
                                        {filename} <span>{files[filename].language}</span>
                                    </li>
                                ))}
                            </ul>
                            <h4>Forked users:</h4>
                            {forkedUsers?.length && (
                                <ul>
                                    {forkedUsers.map((user) => (
                                        <li key={user.owner.login}>
                                            {user.owner.login}{" "}
                                            <img
                                                src={user.owner.avatar_url}
                                                alt={user.owner.login}
                                                width="40"
                                                height="40"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </article>
                ))}
            </main>
            <footer className="app-footer"></footer>
        </div>
    );
}

export default App;
