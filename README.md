# **A1 Group RA Dashboard**

A1 Group revenue assurance dashboard URL: http://cra.a1telekom.inside:9000

The main features include:

- **AMX Datos** (provides catalogue and framework for managing group AMX indicators)
- **AMX Metrics** (provides catalogue and framework for calculating group AMX metrics)
- **Data-flow modeler** (provides repository of systems, interfaces, datasources, procedures and controls)
- **RA Incident management** (provides framework for incident management and incident reporting)
- **Risk catalogue** (provides repository of risks, root causes and generic revenue assurance controls)
- **Risk node modeler** (enables risk assessment of defined product segments in context of the process and core system)
- **Risk coverage visualization and analysis** (provides means to set priorities and plan risk mitigation strategies)

## Getting Started

### Prerequisites
Install the required software:
- [Git](https://git-scm.com/)
- [Node.js (^7.1) and npm (^3.5.2)](https://nodejs.org/en/download/)
- [MySQL (^5.7.21)](https://dev.mysql.com/downloads/mysql/)
- [Bower](https://bower.io/) (`npm install --global bower`)
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)

### Set-up and run

After the prerequisites are installed:

1. Clone this repository using `git` command from the terminal:
```shell
git clone https://tasktrack.telekom.at/bitbucket/scm/tagra/a1g-ra-dashboard.git
```
this will create directory named `a1g-ra-dashboard` in your working directory.

2. Change the working directory to the newly created location: 
```shell
cd a1g-ra-dashboard
```

3. To install the server dependencies run:
```shell
npm install
```

4. To install the front-end dependencies:
```shell
bower install
```

5. Create DB connection config file `server/utils/db.js`:

```javascript
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit	: 10,
	host : 'localhost',
	database : 'tag',
	user : 'user',
	password : 'password'
});
module.exports = pool;
``` 
**Note:**
	> Be sure to set the right MySQL server parameters for *user* and *password* placeholders (ask for test MySQL DB server access)
	> You can copy the example snippet above or you can rename and edit the included example file `server/utils/db.js.spec` in the cloed project

### Test
Run `grunt test` to run all tests.

### Build for production

1. Run `grunt build` for running all tests and building production project.

2. Run `grunt serve` for "live" preview in a browser.