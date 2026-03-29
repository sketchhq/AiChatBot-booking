export interface IDatabaseConfigAttributes {
    username?: string;
    password?: string;
    database?: string;
    host?: string;
    port?: number | string;
    dialect?: string;
    urlDatabase?: string;
    frontEndBaseUrl?: string;
}


export interface IDatabaseConfig {
    development: IDatabaseConfigAttributes;
    local: IDatabaseConfigAttributes;
    staging: IDatabaseConfigAttributes;
    production: IDatabaseConfigAttributes;
}
