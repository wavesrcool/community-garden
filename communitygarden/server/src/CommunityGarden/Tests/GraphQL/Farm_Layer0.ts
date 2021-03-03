import faker from "faker";

export let farm_values = {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    birth_date: "1990-01-29",
    email: faker.internet.email(),
    username: faker.lorem.word(),
    password: faker.internet.password(),
    geocode: {
        geolocation: {
            lat: parseFloat(faker.address.latitude()),
            lng: parseFloat(faker.address.longitude())
        }
    },
    farm_name: faker.company.companyName(),
    delivery_gradient: [
        {
            radius: 5,
            cost: 5
        },
        {
            radius: 10,
            cost: 7
        },
        {
            radius: 20,
            cost: 10
        },
    ]
};

export const signUpFarm = `mutation SignUpFarm {
    signUpFarm(
      signup_data: {
          first_name: "${farm_values.first_name}"
          last_name: "${farm_values.last_name}"
          birth_date: "${farm_values.birth_date}"
          email: "${farm_values.email}"
          username: "${farm_values.username}"
          password: "${farm_values.password}"
          geocode: {
              geolocation: {
                  lat: ${farm_values.geocode.geolocation.lat}
                  lng: ${farm_values.geocode.geolocation.lng}
              }
          }
          farm_name: "${farm_values.farm_name}"
          delivery_gradient: [
            {
                radius: 5,
                cost: 5
            },
            {
                radius: 10,
                cost: 7
            },
            {
                radius: 20,
                cost: 10
            }
        ]
      }
    ) {
      errors {
        path
        message
      }
      account {
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
            geocode {
                geolocation {
                    lat
                    lng
                  }
              }
            delivery_gradient {
                radius
                cost
            }
      }
    }
}`

export const loginFarm = `mutation LoginFarm {
    login(login_credentials: {
      username: "${farm_values.username}"
      password: "${farm_values.password}"
    }) {
        errors {
          path
          message
        }
        account {
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
          farm {
            farm_name
            geocode {
                geolocation {
                    lat
                    lng
                }
              }
          }
        }
      }
}`