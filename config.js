module.exports = {
	environment:'production',
	/*! **** BASE DE DONNNEES *****/
	db : {dev:
				{host  : "localhost",
				user    : "admin",
				port    : "",
				pass    :"Dgps--mhCgSI",
				dbname  : "aikido"
			},
		production:
				{host  : "localhost",
				user    : "admin",
				pass    : "Dgps--mhCgSI",
				port    : "",
				dbname  : "aikido",
				}
		},
	/*! **** LISTE DES APPLICATIONS ***/
	apps : ['admin'
		
		   ],
	GOOGLE_API_KEY:"AIzaSyAnQcvnYDFzj1hHFK9CkbmPc9Dq2qh8-Mc",
	/*! ***** JETON ANTI FIXATION DE SESSION *****/
	SESSION_SECRET :"fa3d45b57acb0c0d1624a5401668a22e",
	CSRF_TOKEN : "a6e65e5ff8ba65062b6f946ba8dc97f9",
	SALT       : "7fe6492b09c24db1f18dd3f9a83b464b",
	default_admin :"admin",
	default_pw_admin :"admin",
	/*! ***** ROUTE DE LA RACINE DE L'APPLICATION ****/
	ROOT_DIR:__dirname,
	UPLOADS_DIR:__dirname+'/uploads/',
	/*! ***** FICHIERS LIBRAIRIE ANGULAR *********/
	angular:['angular.min.js',
			'angular-route.min.js',
			'angular-sanitize.min.js'
			],
	/*! PAR DEFAULT LE PROGRAMME CHARGE DANS LE CONTEXTE L'ENSEMBLE DES FICHIERS JAVASCRIPTS
	 * PRESENTS COTE CLIENT DANS L'APPLICATION, POUR AVOIR UN COMPORTEMENT DIFFERENT VOUS POUVEZ
	 * CONTINUER CE FICHIER */
	angular_commons:['admin/services.js'
			],

	}
