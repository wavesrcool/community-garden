import faker from "faker";

export let public_values = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  birth_date: "1990-01-29",
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  geocode: {
    geolocation: {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude())
    }
  },
};

export const signUpPublic = `mutation SignUpPublic {
    signUpPublic(
      signup_data: {
          first_name: "${public_values.first_name}"
          last_name: "${public_values.last_name}"
          birth_date: "${public_values.birth_date}"
          email: "${public_values.email}"
          username: "${public_values.username}"
          password: "${public_values.password}"
          geocode: {
              geolocation: {
                  lat: ${public_values.geocode.geolocation.lat}
                  lng: ${public_values.geocode.geolocation.lng}
              }
          }
      }
    ) {
      errors {
        path
        message
      }
      account {
        farmId
        first_name
        last_name
        birth_date
        email
        username
        geocode {
          geolocation {
              lat
              lng
          }
        }
      }
      farm {
        farm_name
      }
    }
}`





export const loginPublic = `mutation Login {
    login(login_credentials: {
      username: "${public_values.username}"
      password: "${public_values.password}"
    }) {
        errors {
          path
          message
        }
        account {
          farmId
          first_name
          last_name
          birth_date
          email
          username
          geocode {
            geolocation {
                lat
                lng
            }
          }
        }
      }
}`