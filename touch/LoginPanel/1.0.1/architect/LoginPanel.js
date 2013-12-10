{
    "className": "sencha.login.LoginPanel",
    "classAlias": "widget.loginpanel",
    "inherits": "tabpanel",
    "autoName": "MyLoginPanel",
    "helpText": "Login Panel",
    "noSetup": true,

    "toolbox": {
        "name": "Login Panel",
        "category": "Containers",
        "groups": ["Containers"]
    },

    "events": [{
        "name": "register",
        "params": [
            {
                "name": "loginpanel",
                "type": "sencha.login.LoginPanel",
                "optional": false
            },
            {
                "name": "values",
                "type": "Object",
                "optional": false
            }
        ]
    },{
        "name": "login",
        "params": [
            {
                "name": "loginpanel",
                "type": "sencha.login.LoginPanel",
                "optional": false
            },
            {
                "name": "values",
                "type": "Object",
                "optional": false
            }
        ]
    }],

    "items": [{
        "type": "tabbar",
        "configs": {
            "docked": "bottom"
        }
    },{
        "type": "carousel",
        "startCollapsed": true,
        "noSetup": true,
        "configs": {
            "title": "About",
            "designer|displayName": "About"
        },
        "items": [{
            "type": "container",
            "items": [{
                "type": "label",
                "configs": {
                    "centered": true,
                    "html": "About 1"
                }
            }]
        },{
            "type": "container",
            "items": [{
                "type": "label",
                "configs": {
                    "centered": true,
                    "html": "About 2"
                }
            }]
        },{
            "type": "container",
            "items": [{
                "type": "label",
                "configs": {
                    "centered": true,
                    "html": "About 3"
                }
            }]
        }]
    },{
        "type": "formpanel",
        "startCollapsed": true,
        "configs": {
            "title": "Register",
            "iconCls": "user",
            "itemId": "register",
            "designer|displayName": "Register"
        },
        "items": [{
            "type": "fieldset",
            "noSetup": true,
            "configs": {
                "margin": 5,
                "title": "Required",
                "itemId": "required"
            },
            "items": [{
                "type": "emailfield",
                "configs": {
                    "name": "email",
                    "label": "Email",
                    "labelWidth": 100,
                    "placeHolder": "email@example.com"
                }
            },{
                "type": "passwordfield",
                "configs": {
                    "name": "password",
                    "label": "Password",
                    "labelWidth": 100
                }
            },{
                "type": "passwordfield",
                "configs": {
                    "name": "confirm",
                    "label": "Confirm",
                    "labelWidth": 100
                }
            }]
        },{
            "type": "fieldset",
            "noSetup": true,
            "configs": {
                "margin": "-5 5 0 5",
                "title": "Other Information",
                "itemId": "other"
            },
            "items": [{
                "type": "textfield",
                "configs": {
                    "name": "name",
                    "label": "Name",
                    "labelWidth": 100
                }
            },{
                "type": "textfield",
                "configs": {
                    "name": "address",
                    "label": "Address",
                    "labelWidth": 100
                }
            }]
        },{
            "type": "button",
            "configs": {
                "itemId": "registerBtn",
                "margin": 20,
                "ui": "confirm",
                "text": "Register"
            },
            "items": [{
                "type": "basiceventbinding",
                "configs": {
                    "fn": "onRegisterButtonTap",
                    "name": "tap",
                    "implHandler": "var panel = button.up('formpanel'),\n\tvalues = panel.getValues();\n\npanel.parent.fireEvent('register', panel, values);"
                }
            }]
        }]
    },{
        "type": "formpanel",
        "startCollapsed": true,
        "configs": {
            "layout": "card",
            "title": "Log in",
            "iconCls": "action",
            "itemId": "login",
            "designer|displayName": "Login"
        },
        "items": [{
            "type": "container",
            "configs": {
                "layout": "vbox",
                "container|pack": "center"
            },
            "items": [{
                "type": "fieldset",
                "noSetup": true,
                "configs": {
                    "margin": 5
                },
                "items": [{
                    "type": "emailfield",
                    "configs": {
                        "name": "email",
                        "label": "Email",
                        "labelWidth": 100,
                        "placeHolder": "email@example.com"
                    }
                },{
                    "type": "passwordfield",
                    "configs": {
                        "name": "password",
                        "label": "Password",
                        "labelWidth": 100
                    }
                }]
            },{
                "type": "button",
                "configs": {
                    "itemId": "loginBtn",
                    "margin": 20,
                    "ui": "confirm",
                    "text": "Log in"
                },
                "items": [{
                    "type": "basiceventbinding",
                    "configs": {
                        "fn": "onLoginButtonTap",
                        "name": "tap",
                        "implHandler": "var panel = button.up('formpanel'),\n\tvalues = panel.getValues();\n\npanel.parent.fireEvent('login', panel, values);"
                    }
                }]
            }]
        }]
    }]
}
