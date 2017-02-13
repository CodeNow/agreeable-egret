# Agreeable Egret Atlassian Add-on

This Express application communicates with JIRA applications that have installed this add-on by querying our API to find the right environment for an issue. It works by examining the issue number in the url, from which the request to this service is sent, to find the branch used when the instance was created. It also checks the organization from the URL and checks the mapping in the postgres database to find the github org. 

The add-on works simply, it loads a component on the JIRA page by sending a request out to a URL configured in the atlassian-connect file, which will return HTML/CSS to display. It can also run a script if necessary on the page.

Authentication is handled by the atlassian middleware. It communicates with API using the Hello Runnable github token, which prevents other users from getting to the /allInstances route on api. It uses a postgres database that contains user secrets and client keys, along with a table containing a mapping between the org that atlassian is aware of and is identified in a subdomain (i.e., runnable.atlassian.com) and the github organization that was use to query instances.
