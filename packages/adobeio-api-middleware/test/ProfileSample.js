const TEST_PKEY = '@xxx-dummy-pkey-xxx';
const TEST_DOMAIN = 'customer.com';
const TEST_TENANT = `dummy.${TEST_DOMAIN}`;
const TEST_EMAIL = `john@${TEST_DOMAIN}`;
const TEST_PHONE = '+15555555555';
const TEST_PHONE2 = '+14444444444';

const TEST_PROFILE_RESPONSE = { content:
    [ { PKey:
      TEST_PKEY,
      age: 0,
      birthDate: '',
      created: '2018-08-01 22:43:48.892Z',
      cryptedId:
        'xxx-cryptedId-xxx',
      domain: TEST_DOMAIN,
      email: TEST_EMAIL,
      emailFormat: 'html',
      fax: '',
      firstName: 'John',
      gender: 'male',
      href:
        `https://mc.adobe.io/${TEST_TENANT}/campaign/profileAndServices/profile/${TEST_PKEY}`,
      isExternal: false,
      lastModified: '2018-10-15 23:40:09.957Z',
      lastName: 'Smith',
      location: null,
      middleName: '',
      mobilePhone: TEST_PHONE,
      phone: '',
      postalAddress: null,
      preferredLanguage: 'en_us',
      salutation: 'Tester',
      subscriptions: null,
      thumbnail: '/nl/img/thumbnails/defaultProfil.png',
      timeZone: 'none',
      title: `John Smith (${TEST_EMAIL})` } ],
  count:
    { href:
        `https://mc.adobe.io/${TEST_TENANT}/campaign/profileAndServices/profile//byEmail/_count?email=${TEST_EMAIL}&_lineStart=@12345`,
      value: 1 },
  serverSidePagination: true };

let response2 = JSON.parse(JSON.stringify(TEST_PROFILE_RESPONSE));
response2.content[0].mobilePhone = TEST_PHONE2;

export const TEST_DATA = {
  pkey : TEST_PKEY,
  tenant : TEST_TENANT,
  email : TEST_EMAIL,
  domain : TEST_DOMAIN,
  response : TEST_PROFILE_RESPONSE,
  phone : TEST_PHONE,
  phone2 : TEST_PHONE2,
  response2 : response2
};

