var database = 'ARABCO_PROD';

var getCreditLimit = `Select top 2 "CardCode", "New Debit Limit" as "CreditLimit" From "${database}"."ABS_Update_Customer_Limit"`;

module.exports = {getCreditLimit};


