annotate solutionService.ProjectSet with @(  
    title       : 'Project',
    description : 'here are some projects',
    UI : { 
        HeaderInfo          : {
             $Type          : 'UI.HeaderInfoType',
             TypeName       : 'Project',
             TypeNamePlural : 'Projects',
             Title: {Value: projectName},
             Description: {Value: projectName},
             ImageUrl: picture             
        },        
        SelectionFields  : [
            'projectName',
        ],               
        LineItem : [
            {
                $Type : 'UI.DataField',
                Value : projectName,
                Label : 'Project name'
            },
            {
                $Type : 'UI.DataField',
                Value : registeredHours,
                Label : 'Registered hours'
            },
            {
                $Type : 'UI.DataField',
                Value : maxHours,
                Label : 'Maximum hours'
            }     
        ],
       
        HeaderFacets: [
                {
                $Type: 'UI.ReferenceFacet', 
                Label: 'Project name', 
                Target: '@UI.FieldGroup#Name'
            },
            ],
        Facets: [
            {
                $Type: 'UI.ReferenceFacet', 
                Label: 'Users', 
                Target: 'users/@UI.LineItem'
            }
        ], 
        FieldGroup#Name: {
            Data: [
                {
                    Value: name
                },
            ]
        }, 
    },
    Capabilities.DeleteRestrictions : {
        Deletable   : false, 
    },
    Capabilities.FilterRestrictions     : {
        FilterExpressionRestrictions : [{
            Property          : projectName,
            AllowedExpressions : 'SingleValue'
        }],
        /*
        RequiredProperties : [name]
        */
    }      
);

annotate solutionService.User2Project with @(
    title       : 'User2Project',
    description : 'User2Project Desc',
	UI: {
		LineItem: [			
      {
          $Type : 'UI.DataField',
          Value : user.firstName,
          Label : 'Firstname',
      },	
      {
          $Type : 'UI.DataField',
          Value : user.lastName,
          Label : 'Lastname',
      },	
      {
          $Type : 'UI.DataField',
          Value : project.projectName,
          Label : 'Firstname',
      },		
        ]
		// Identification: [ //Is the main field group
		// 	  {Value: title, Label:'Title'}
		// ],
		// Facets: [
		// 	  {$Type: 'UI.ReferenceFacet', Label: '{i18n>OrderItems}', Target: '@UI.Identification'},
		// ],    
	}
);