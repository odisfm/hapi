# Environments

This project uses two live environments, with near-identical but separate [cloud infrastructure](../infrastructure/infrastructure-proposal.md).

## Staging

This environment contains the absolute latest code on the `main` branch, [deployed automatically](../processes/CI-CD.md#on-merge-to-main) when code is merged.

This allows us to always have a live version of the codebase with the latest changes, and lets us manually test the project in a real environment. 
The database is separate from the production environment, so we can modify data without affecting production.

[Click here to go to the staging environment](http://frontend-staging-676787762676-ap-southeast-4-an.s3-website.ap-southeast-4.amazonaws.com/).

## Production

This environment is only deployed manually, once we are satisfied that the staging environment is working properly.
If this were a live project, this would be the site that the public sees.

[Click here to go to the production environment](http://frontend-production-676787762676-ap-southeast-4-an.s3-website.ap-southeast-4.amazonaws.com/).

