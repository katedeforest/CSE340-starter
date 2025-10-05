-- 
-- TASK 1
-- 

-- Statement 1: 
INSERT INTO public.account (
account_firstname,
account_lastname,
account_email,
account_password
)
VALUES (
'Tony',
'Stark',
'tony@starkent.com',
'Iam1ronM@n'
);

-- Statement 2:
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Statement 3:
DELETE FROM public.account
WHERE account_id = 1;

-- Statement 4:
UPDATE public.inventory
SET inv_description = REPLACE (inv_description, 'the small interiors', 'a huge interior')
WHERE inv_id = 10;

-- Statement 5:
SELECT
	inventory.inv_make, 
	inventory.inv_model, 
	classification.classification_name
FROM public.classification
INNER JOIN public.inventory ON classification.classification_id = inventory.classification_id
WHERE classification_name = 'Sport';

-- Statement 6:
UPDATE public.inventory
SET inv_image = REPLACE (inv_image, 's/', 's/vehicles/'),
inv_thumbnail = REPLACE (inv_thumbnail, 's/', 's/vehicles/');
