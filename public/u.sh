#!/usr/bin/env bash
# Update the existing personal service and install its durable render job.
# This script never prints or changes UNIFY_KEY; Cloud Run preserves it.
set -euo pipefail
umask 077
LEGADO_PROJECT_ID="${LEGADO_PROJECT_ID:-creaciondecontenido1}"
LEGADO_REGION="${LEGADO_REGION:-us-central1}"
LEGADO_STUDIO_ORIGIN="${LEGADO_STUDIO_ORIGIN:-https://studio.legadodehierro.com}"
LEGADO_WORK_DIR=$(mktemp -d)
trap 'rm -rf "$LEGADO_WORK_DIR"' EXIT
gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format=json > "$LEGADO_WORK_DIR/service.json"
LEGADO_BUCKET=$(python3 - "$LEGADO_WORK_DIR/service.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
env=d['spec']['template']['spec']['containers'][0].get('env',[])
bucket=next((e.get('value','') for e in env if e['name']=='BUCKET'),'')
if not bucket: sys.exit('Falta BUCKET en el servicio existente.')
print(bucket)
PY
)
# The service description contains environment values. Never send it to builds.
rm "$LEGADO_WORK_DIR/service.json"
LEGADO_SERVICE_ACCOUNT=$(gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(spec.template.spec.serviceAccountName)')
if [ -z "$LEGADO_SERVICE_ACCOUNT" ]; then
  LEGADO_PROJECT_NUMBER=$(gcloud projects describe "$LEGADO_PROJECT_ID" --format='value(projectNumber)')
  LEGADO_SERVICE_ACCOUNT="${LEGADO_PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi
# Direct uploads need GET/PUT CORS for the studio. Keep the other apps' rules.
gcloud storage buckets describe "gs://$LEGADO_BUCKET" --project "$LEGADO_PROJECT_ID" --format='json(cors_config)' > "$LEGADO_WORK_DIR/cors-old.json"
python3 - "$LEGADO_WORK_DIR/cors-old.json" "$LEGADO_WORK_DIR/cors.json" "$LEGADO_STUDIO_ORIGIN" <<'PYTHON_CORS'
import json,sys
from urllib.parse import urlsplit
origin=sys.argv[3]
u=urlsplit(origin)
if u.scheme not in ('https','http') or not u.netloc or u.path not in ('','/'):
    sys.exit('LEGADO_STUDIO_ORIGIN debe ser el origen de la aplicación, sin ruta.')
old=json.load(open(sys.argv[1])).get('cors_config',[]) or []
if not isinstance(old,list): sys.exit('No se pudo leer CORS; no se modificó el bucket.')
rule={'origin':[origin.rstrip('/')],'method':['GET','HEAD','PUT'],'responseHeader':['Content-Type','Content-Length','ETag'],'maxAgeSeconds':3600}
if rule not in old: old.append(rule)
json.dump(old,open(sys.argv[2],'w'))
PYTHON_CORS
gcloud storage buckets update "gs://$LEGADO_BUCKET" --project "$LEGADO_PROJECT_ID" --cors-file="$LEGADO_WORK_DIR/cors.json" --quiet
rm "$LEGADO_WORK_DIR/cors-old.json" "$LEGADO_WORK_DIR/cors.json"
cd "$LEGADO_WORK_DIR"
cat > package.json <<'ARCHIVO_FIN'
{
  "name": "legado-unify",
  "version": "3.0.0",
  "description": "Montaje personal de imágenes, clips, narración y música con Cloud Run Jobs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=24"
  },
  "dependencies": {
    "@google-cloud/storage": "^7.0.0",
    "google-auth-library": "^9.0.0"
  }
}
ARCHIVO_FIN

cat > package-lock.json <<'ARCHIVO_FIN'
{
  "name": "legado-unify",
  "version": "3.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "legado-unify",
      "version": "3.0.0",
      "dependencies": {
        "@google-cloud/storage": "^7.0.0",
        "google-auth-library": "^9.0.0"
      },
      "engines": {
        "node": ">=24"
      }
    },
    "node_modules/@google-cloud/paginator": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/@google-cloud/paginator/-/paginator-5.0.2.tgz",
      "integrity": "sha512-DJS3s0OVH4zFDB1PzjxAsHqJT6sKVbRwwML0ZBP9PbU7Yebtu/7SWMRzvO2J3nUi9pRNITCfu4LJeooM2w4pjg==",
      "license": "Apache-2.0",
      "dependencies": {
        "arrify": "^2.0.0",
        "extend": "^3.0.2"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@google-cloud/projectify": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@google-cloud/projectify/-/projectify-4.0.0.tgz",
      "integrity": "sha512-MmaX6HeSvyPbWGwFq7mXdo0uQZLGBYCwziiLIGq5JVX+/bdI3SAq6bP98trV5eTWfLuvsMcIC1YJOF2vfteLFA==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@google-cloud/promisify": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/@google-cloud/promisify/-/promisify-4.0.0.tgz",
      "integrity": "sha512-Orxzlfb9c67A15cq2JQEyVc7wEsmFBmHjZWZYQMUyJ1qivXyMwdyNOs9odi79hze+2zqdTtu1E19IM/FtqZ10g==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@google-cloud/storage": {
      "version": "7.22.0",
      "resolved": "https://registry.npmjs.org/@google-cloud/storage/-/storage-7.22.0.tgz",
      "integrity": "sha512-W98gTQOAntEeEQ7/pZxSQXxfUO5CiQcXJRsxBpUa6UU25n8YN/VtogPBi0H+MAmUrn/6bY/sBhFansoWEsr2/g==",
      "license": "Apache-2.0",
      "dependencies": {
        "@google-cloud/paginator": "^5.0.0",
        "@google-cloud/projectify": "^4.0.0",
        "@google-cloud/promisify": "<4.1.0",
        "abort-controller": "^3.0.0",
        "async-retry": "^1.3.3",
        "duplexify": "^4.1.3",
        "fast-xml-parser": "^5.3.4",
        "gaxios": "^6.0.2",
        "google-auth-library": "^9.6.3",
        "html-entities": "^2.5.2",
        "mime": "^3.0.0",
        "p-limit": "^3.0.1",
        "retry-request": "^7.0.0",
        "teeny-request": "^9.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@nodable/entities": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/@nodable/entities/-/entities-3.0.0.tgz",
      "integrity": "sha512-8L9xFeTYKhm49xfIypoe2W5wV1m/3Z58kT+7kR9A8OyFxcPduI4VmxaUMQyKYrRjUoLLSXv6EKKID5Tvj9cUVw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodable"
        }
      ],
      "license": "MIT"
    },
    "node_modules/@tootallnate/once": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/@tootallnate/once/-/once-2.0.1.tgz",
      "integrity": "sha512-HqmEUIGRJ5fSXchkVgR5F7qn48bDBzv0kWj/Kfu5e6uci4UlEeng4331LnBkWffb++Ei3FOVLxo8JJWMFBDMeQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@types/caseless": {
      "version": "0.12.5",
      "resolved": "https://registry.npmjs.org/@types/caseless/-/caseless-0.12.5.tgz",
      "integrity": "sha512-hWtVTC2q7hc7xZ/RLbxapMvDMgUnDvKvMOpKal4DrMyfGBUfB1oKaZlIRr6mJL+If3bAP6sV/QneGzF6tJjZDg==",
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "26.5.1",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-26.5.1.tgz",
      "integrity": "sha512-CzNm2FezW4VR/LjG6yUdiEgLE/rAQ9Slj5gCu/C2VrdcW7I0ahNZ8DRbHT7zOZ6r3ONgd/bsQIeSaoDGrd1C6g==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~8.9.0"
      }
    },
    "node_modules/@types/request": {
      "version": "2.48.13",
      "resolved": "https://registry.npmjs.org/@types/request/-/request-2.48.13.tgz",
      "integrity": "sha512-FGJ6udDNUCjd19pp0Q3iTiDkwhYup7J8hpMW9c4k53NrccQFFWKRho6hvtPPEhnXWKvukfwAlB6DbDz4yhH5Gg==",
      "license": "MIT",
      "dependencies": {
        "@types/caseless": "*",
        "@types/node": "*",
        "@types/tough-cookie": "*",
        "form-data": "^2.5.5"
      }
    },
    "node_modules/@types/tough-cookie": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/@types/tough-cookie/-/tough-cookie-4.0.5.tgz",
      "integrity": "sha512-/Ad8+nIOV7Rl++6f1BdKxFSMgmoqEoYbHRpPcx3JEfv8VRsQe9Z4mCXeJBzxs7mbHY/XOZZuXlRNfhpVPbs6ZA==",
      "license": "MIT"
    },
    "node_modules/abort-controller": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/abort-controller/-/abort-controller-3.0.0.tgz",
      "integrity": "sha512-h8lQ8tacZYnR3vNQTgibj+tODHI5/+l06Au2Pcriv/Gmet0eaj4TwWH41sO9wnHDiQsEj19q0drzdWdeAHtweg==",
      "license": "MIT",
      "dependencies": {
        "event-target-shim": "^5.0.0"
      },
      "engines": {
        "node": ">=6.5"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/anynum": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/anynum/-/anynum-1.0.1.tgz",
      "integrity": "sha512-N6//FLET/tXYNM/F6ABca1oH6fWB+KlTt909Le28WMDBk8oaT4vY17DCrwg2MvmuqUKt3Ni4N5dGJ/EoBgcO6A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT"
    },
    "node_modules/arrify": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/arrify/-/arrify-2.0.1.tgz",
      "integrity": "sha512-3duEwti880xqi4eAMN8AyR4a0ByT90zoYdLlevfrvU43vb0YZwZVfxOgxWrLXXXpyugL0hNZc9G6BiB5B3nUug==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/async-retry": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/async-retry/-/async-retry-1.3.3.tgz",
      "integrity": "sha512-wfr/jstw9xNi/0teMHrRW7dsz3Lt5ARhYNZ2ewpadnhaIp5mbALhOAP+EAdsC7t4Z6wqsDVv9+W6gm1Dk9mEyw==",
      "license": "MIT",
      "dependencies": {
        "retry": "0.13.1"
      }
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "license": "MIT"
    },
    "node_modules/base64-js": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/bignumber.js": {
      "version": "9.3.1",
      "resolved": "https://registry.npmjs.org/bignumber.js/-/bignumber.js-9.3.1.tgz",
      "integrity": "sha512-Ko0uX15oIUS7wJ3Rb30Fs6SkVbLmPBAKdlm7q9+ak9bbIeFf0MwuBsQV6z7+X768/cHsfg+WlysDWJcmthjsjQ==",
      "license": "MIT",
      "engines": {
        "node": "*"
      }
    },
    "node_modules/buffer-equal-constant-time": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/buffer-equal-constant-time/-/buffer-equal-constant-time-1.0.1.tgz",
      "integrity": "sha512-zRpUiDwd/xk6ADqPMATG8vc9VPrkck7T07OIx0gnjmJAnHnTVXNQG3vfvWNuiZIkwu9KrKdA1iJKfsfTVxE6NA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/duplexify": {
      "version": "4.1.3",
      "resolved": "https://registry.npmjs.org/duplexify/-/duplexify-4.1.3.tgz",
      "integrity": "sha512-M3BmBhwJRZsSx38lZyhE53Csddgzl5R7xGJNk7CVddZD6CcmwMCH8J+7AprIrQKH7TonKxaCjcv27Qmf+sQ+oA==",
      "license": "MIT",
      "dependencies": {
        "end-of-stream": "^1.4.1",
        "inherits": "^2.0.3",
        "readable-stream": "^3.1.1",
        "stream-shift": "^1.0.2"
      }
    },
    "node_modules/ecdsa-sig-formatter": {
      "version": "1.0.11",
      "resolved": "https://registry.npmjs.org/ecdsa-sig-formatter/-/ecdsa-sig-formatter-1.0.11.tgz",
      "integrity": "sha512-nagl3RYrbNv6kQkeJIpt6NJZy8twLB/2vtz6yN9Z4vRKHN4/QZJIEbqohALSgwKdnksuY3k5Addp5lg8sVoVcQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/end-of-stream": {
      "version": "1.4.5",
      "resolved": "https://registry.npmjs.org/end-of-stream/-/end-of-stream-1.4.5.tgz",
      "integrity": "sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==",
      "license": "MIT",
      "dependencies": {
        "once": "^1.4.0"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/event-target-shim": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/event-target-shim/-/event-target-shim-5.0.1.tgz",
      "integrity": "sha512-i/2XbnSz/uxRCU6+NdVJgKWDTM427+MqYbkQzD321DuCQJUqOuJKIA0IM2+W2xtYHdKOmZ4dR6fExsd4SXL+WQ==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/extend": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/extend/-/extend-3.0.2.tgz",
      "integrity": "sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==",
      "license": "MIT"
    },
    "node_modules/fast-xml-builder": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/fast-xml-builder/-/fast-xml-builder-1.3.1.tgz",
      "integrity": "sha512-pIM/1n3ntFXKYrUZwW7QCK0gAW7XY+wzj1YMIV3tLDvPj/V+zTGJK5e3/4WJfwj0qWw2ElNXiTixda/R+3YSug==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "path-expression-matcher": "^1.6.2",
        "xml-naming": "^0.3.0"
      }
    },
    "node_modules/fast-xml-parser": {
      "version": "5.11.1",
      "resolved": "https://registry.npmjs.org/fast-xml-parser/-/fast-xml-parser-5.11.1.tgz",
      "integrity": "sha512-TBw6K/fxoQGGjCmZDw9w/ZwP3uDcnTM4YH/g+PFRWr8sbe5idXtxNN6vITh4+1ruCZaho6uBFurElsA7F0zzgw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@nodable/entities": "^3.0.0",
        "fast-xml-builder": "^1.2.0",
        "is-unsafe": "^2.0.0",
        "path-expression-matcher": "^1.6.2",
        "strnum": "^2.4.2",
        "xml-naming": "^0.3.0"
      },
      "bin": {
        "fxparser": "src/cli/cli.js"
      }
    },
    "node_modules/form-data": {
      "version": "2.5.6",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-2.5.6.tgz",
      "integrity": "sha512-Ogz/E85h9tlfJzpI6TuFpGcHZFhLrb9Gw8wq9v40CxSCPnv7ahKr6Xgtkn0KYCDQJ8DNn5VoMO8EXr9V5PadyA==",
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.4",
        "mime-types": "^2.1.35",
        "safe-buffer": "^5.2.1"
      },
      "engines": {
        "node": ">= 0.12"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gaxios": {
      "version": "6.7.1",
      "resolved": "https://registry.npmjs.org/gaxios/-/gaxios-6.7.1.tgz",
      "integrity": "sha512-LDODD4TMYx7XXdpwxAVRAIAuB0bzv0s+ywFonY46k126qzQHT9ygyoa9tncmOiQmmDrik65UYsEkv3lbfqQ3yQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "extend": "^3.0.2",
        "https-proxy-agent": "^7.0.1",
        "is-stream": "^2.0.0",
        "node-fetch": "^2.6.9",
        "uuid": "^9.0.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/gcp-metadata": {
      "version": "6.1.1",
      "resolved": "https://registry.npmjs.org/gcp-metadata/-/gcp-metadata-6.1.1.tgz",
      "integrity": "sha512-a4tiq7E0/5fTjxPAaH4jpjkSv/uCaU2p5KC6HVGrvl0cDjA8iBZv4vv1gyzlmK0ZUKqwpOyQMKzZQe3lTit77A==",
      "license": "Apache-2.0",
      "dependencies": {
        "gaxios": "^6.1.1",
        "google-logging-utils": "^0.0.2",
        "json-bigint": "^1.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/google-auth-library": {
      "version": "9.15.1",
      "resolved": "https://registry.npmjs.org/google-auth-library/-/google-auth-library-9.15.1.tgz",
      "integrity": "sha512-Jb6Z0+nvECVz+2lzSMt9u98UsoakXxA2HGHMCxh+so3n90XgYWkq5dur19JAJV7ONiJY22yBTyJB1TSkvPq9Ng==",
      "license": "Apache-2.0",
      "dependencies": {
        "base64-js": "^1.3.0",
        "ecdsa-sig-formatter": "^1.0.11",
        "gaxios": "^6.1.1",
        "gcp-metadata": "^6.1.0",
        "gtoken": "^7.0.0",
        "jws": "^4.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/google-logging-utils": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/google-logging-utils/-/google-logging-utils-0.0.2.tgz",
      "integrity": "sha512-NEgUnEcBiP5HrPzufUkBzJOD/Sxsco3rLNo1F1TNf7ieU8ryUzBhqba8r756CjLX7rn3fHl6iLEwPYuqpoKgQQ==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gtoken": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/gtoken/-/gtoken-7.1.0.tgz",
      "integrity": "sha512-pCcEwRi+TKpMlxAQObHDQ56KawURgyAf6jtIY046fJ5tIv3zDe/LEIubckAO8fj6JnAxLdmWkUfNyulQ2iKdEw==",
      "license": "MIT",
      "dependencies": {
        "gaxios": "^6.0.0",
        "jws": "^4.0.0"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/html-entities": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/html-entities/-/html-entities-2.6.0.tgz",
      "integrity": "sha512-kig+rMn/QOVRvr7c86gQ8lWXq+Hkv6CbAH1hLu+RG338StTpE8Z0b44SDVaqVu7HGKf27frdmUYEs9hTUX/cLQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/mdevils"
        },
        {
          "type": "patreon",
          "url": "https://patreon.com/mdevils"
        }
      ],
      "license": "MIT"
    },
    "node_modules/http-proxy-agent": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/http-proxy-agent/-/http-proxy-agent-5.0.0.tgz",
      "integrity": "sha512-n2hY8YdoRE1i7r6M0w9DIw5GgZN0G25P8zLCRQ8rjXtTU3vsNFBI/vWK/UIeE6g5MUUz6avwAPXmL6Fy9D/90w==",
      "license": "MIT",
      "dependencies": {
        "@tootallnate/once": "2",
        "agent-base": "6",
        "debug": "4"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/http-proxy-agent/node_modules/agent-base": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-6.0.2.tgz",
      "integrity": "sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "4"
      },
      "engines": {
        "node": ">= 6.0.0"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/is-stream": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/is-stream/-/is-stream-2.0.1.tgz",
      "integrity": "sha512-hFoiJiTl63nn+kstHGBtewWSKnQLpyb155KHheA1l39uvtO9nWIop1p3udqPcUd/xbF1VLMO4n7OI6p7RbngDg==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/is-unsafe": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/is-unsafe/-/is-unsafe-2.0.2.tgz",
      "integrity": "sha512-HgbIHPBH0KHHCcjLfGsCvhtPTVxjaAZlXjwdz7/GQC40SjSe4sfQsar8J5VFo8JOSbarkpV0OLG95bbaNd9aAQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT"
    },
    "node_modules/json-bigint": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/json-bigint/-/json-bigint-1.0.0.tgz",
      "integrity": "sha512-SiPv/8VpZuWbvLSMtTDU8hEfrZWg/mH/nV/b4o0CYbSxu1UIQPLdwKOCIyLQX+VIPO5vrLX3i8qtqFyhdPSUSQ==",
      "license": "MIT",
      "dependencies": {
        "bignumber.js": "^9.0.0"
      }
    },
    "node_modules/jwa": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/jwa/-/jwa-2.0.1.tgz",
      "integrity": "sha512-hRF04fqJIP8Abbkq5NKGN0Bbr3JxlQ+qhZufXVr0DvujKy93ZCbXZMHDL4EOtodSbCWxOqR8MS1tXA5hwqCXDg==",
      "license": "MIT",
      "dependencies": {
        "buffer-equal-constant-time": "^1.0.1",
        "ecdsa-sig-formatter": "1.0.11",
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/jws": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/jws/-/jws-4.0.1.tgz",
      "integrity": "sha512-EKI/M/yqPncGUUh44xz0PxSidXFr/+r0pA70+gIYhjv+et7yxM+s29Y+VGDkovRofQem0fs7Uvf4+YmAdyRduA==",
      "license": "MIT",
      "dependencies": {
        "jwa": "^2.0.1",
        "safe-buffer": "^5.0.1"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/mime": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/mime/-/mime-3.0.0.tgz",
      "integrity": "sha512-jSCU7/VB1loIWBZe14aEYHU/+1UMEHoaO7qxCOVJOw9GgH72VAWppxNcjU+x9a2k3GSIBXNKxXQFqRvvZ7vr3A==",
      "license": "MIT",
      "bin": {
        "mime": "cli.js"
      },
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/node-fetch": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-2.7.0.tgz",
      "integrity": "sha512-c4FRfUm/dbcWZ7U+1Wq0AwCyFL+3nt2bEw05wfxSz+DWpWsitgmSgYmy2dQdWyKC1694ELPqMs/YzUSNozLt8A==",
      "license": "MIT",
      "dependencies": {
        "whatwg-url": "^5.0.0"
      },
      "engines": {
        "node": "4.x || >=6.0.0"
      },
      "peerDependencies": {
        "encoding": "^0.1.0"
      },
      "peerDependenciesMeta": {
        "encoding": {
          "optional": true
        }
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/path-expression-matcher": {
      "version": "1.6.2",
      "resolved": "https://registry.npmjs.org/path-expression-matcher/-/path-expression-matcher-1.6.2.tgz",
      "integrity": "sha512-enSlaiat05iasnzmgNxRj8reFdj3puY2QpNgP1aPIaVfT6nn9ICuPoFlKHk8EN22HcwewshO+mN2DGbkCEOtqQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/readable-stream": {
      "version": "3.6.2",
      "resolved": "https://registry.npmjs.org/readable-stream/-/readable-stream-3.6.2.tgz",
      "integrity": "sha512-9u/sniCrY3D5WdsERHzHE4G2YCXqoG5FTHUiCC4SIbr6XcLZBY05ya9EKjYek9O5xOAwjGq+1JdGBAS7Q9ScoA==",
      "license": "MIT",
      "dependencies": {
        "inherits": "^2.0.3",
        "string_decoder": "^1.1.1",
        "util-deprecate": "^1.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/retry": {
      "version": "0.13.1",
      "resolved": "https://registry.npmjs.org/retry/-/retry-0.13.1.tgz",
      "integrity": "sha512-XQBQ3I8W1Cge0Seh+6gjj03LbmRFWuoszgK9ooCpwYIrhhoO80pfq4cUkU5DkknwfOfFteRwlZ56PYOGYyFWdg==",
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/retry-request": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/retry-request/-/retry-request-7.0.2.tgz",
      "integrity": "sha512-dUOvLMJ0/JJYEn8NrpOaGNE7X3vpI5XlZS/u0ANjqtcZVKnIxP7IgCFwrKTxENw29emmwug53awKtaMm4i9g5w==",
      "license": "MIT",
      "dependencies": {
        "@types/request": "^2.48.8",
        "extend": "^3.0.2",
        "teeny-request": "^9.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/stream-events": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/stream-events/-/stream-events-1.0.5.tgz",
      "integrity": "sha512-E1GUzBSgvct8Jsb3v2X15pjzN1tYebtbLaMg+eBOUOAxgbLoSbT2NS91ckc5lJD1KfLjId+jXJRgo0qnV5Nerg==",
      "license": "MIT",
      "dependencies": {
        "stubs": "^3.0.0"
      }
    },
    "node_modules/stream-shift": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/stream-shift/-/stream-shift-1.0.3.tgz",
      "integrity": "sha512-76ORR0DO1o1hlKwTbi/DM3EXWGf3ZJYO8cXX5RJwnul2DEg2oyoZyjLNoQM8WsvZiFKCRfC1O0J7iCvie3RZmQ==",
      "license": "MIT"
    },
    "node_modules/string_decoder": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz",
      "integrity": "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==",
      "license": "MIT",
      "dependencies": {
        "safe-buffer": "~5.2.0"
      }
    },
    "node_modules/strnum": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/strnum/-/strnum-2.4.2.tgz",
      "integrity": "sha512-rDG3Ah4TV0k1hWvLSzkZtMmLN9+eS+h3knq4MP6A42Y3Yh5qGNnOUs1jJkoSr8FG5dsL28c7KgkIBzSEykqtuw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "anynum": "^1.0.1"
      }
    },
    "node_modules/stubs": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/stubs/-/stubs-3.0.0.tgz",
      "integrity": "sha512-PdHt7hHUJKxvTCgbKX9C1V/ftOcjJQgz8BZwNfV5c4B6dcGqlpelTbJ999jBGZ2jYiPAwcX5dP6oBwVlBlUbxw==",
      "license": "MIT"
    },
    "node_modules/teeny-request": {
      "version": "9.0.0",
      "resolved": "https://registry.npmjs.org/teeny-request/-/teeny-request-9.0.0.tgz",
      "integrity": "sha512-resvxdc6Mgb7YEThw6G6bExlXKkv6+YbuzGg9xuXxSgxJF7Ozs+o8Y9+2R3sArdWdW8nOokoQb1yrpFB0pQK2g==",
      "license": "Apache-2.0",
      "dependencies": {
        "http-proxy-agent": "^5.0.0",
        "https-proxy-agent": "^5.0.0",
        "node-fetch": "^2.6.9",
        "stream-events": "^1.0.5",
        "uuid": "^9.0.0"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/teeny-request/node_modules/agent-base": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-6.0.2.tgz",
      "integrity": "sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "4"
      },
      "engines": {
        "node": ">= 6.0.0"
      }
    },
    "node_modules/teeny-request/node_modules/https-proxy-agent": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-5.0.1.tgz",
      "integrity": "sha512-dFcAjpTQFgoLMzC2VwU+C/CbS7uRL0lWmxDITmqm7C+7F0Odmj6s9l6alZc6AELXhrnggM2CeWSXHGOdX2YtwA==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "6",
        "debug": "4"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/tr46": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-0.0.3.tgz",
      "integrity": "sha512-N3WMsuqV66lT30CrXNbEjx4GEwlow3v6rr4mCcv6prnfwhS01rkgyFdjPNBYd9br7LpXV1+Emh01fHnq2Gdgrw==",
      "license": "MIT"
    },
    "node_modules/undici-types": {
      "version": "8.9.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-8.9.0.tgz",
      "integrity": "sha512-KTDyRTYX8sWmKXAikPHHSyc63CRPETMctyjKFupcC6OBLXT3xsN0e9aF7m+mIXutFWpUXuedtowG7iLOzp0kQg==",
      "license": "MIT"
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "license": "MIT"
    },
    "node_modules/uuid": {
      "version": "9.0.1",
      "resolved": "https://registry.npmjs.org/uuid/-/uuid-9.0.1.tgz",
      "integrity": "sha512-b+1eJOlsR9K8HJpow9Ok3fiWOWSIcIzXodvv0rQjVoOVNpWMpxf1wZNpt4y9h10odCNrqnYp1OBzRktckBe3sA==",
      "deprecated": "uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).",
      "funding": [
        "https://github.com/sponsors/broofa",
        "https://github.com/sponsors/ctavan"
      ],
      "license": "MIT",
      "bin": {
        "uuid": "dist/bin/uuid"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-3.0.1.tgz",
      "integrity": "sha512-2JAn3z8AR6rjK8Sm8orRC0h/bcl/DqL7tRPdGZ4I1CjdF+EaMLmYxBHyXuKL849eucPFhvBoxMsflfOb8kxaeQ==",
      "license": "BSD-2-Clause"
    },
    "node_modules/whatwg-url": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-5.0.0.tgz",
      "integrity": "sha512-saE57nupxk6v3HY35+jzBwYa0rKSy0XR8JSxZPwgLr7ys0IBzhGviA1/TUGJLmSVqs8pb9AnvICXEuOHLprYTw==",
      "license": "MIT",
      "dependencies": {
        "tr46": "~0.0.3",
        "webidl-conversions": "^3.0.0"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/xml-naming": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/xml-naming/-/xml-naming-0.3.0.tgz",
      "integrity": "sha512-ghig2TBE/H11aOVgmahA3MhimvkBr6JIYknH/Dhdk10nXwdbIqBJsbfMxpvFPG8bAw77gN29aQWvKpmVoPlvPQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/NaturalIntelligence"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    }
  }
}
ARCHIVO_FIN

cat > Dockerfile <<'ARCHIVO_FIN'
# Servicio legado-unify: Node 24 + ffmpeg (para medir, ajustar velocidad, unir y pegar audio)
# Base fijada a bookworm (Debian 12): garantiza ffmpeg 5.1+, con soporte de
# amix normalize=0, acrossfade y alimiter que usa el pipeline de audio.
FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY index.js timeline.js ./

ENV NODE_ENV=production
CMD ["node", "index.js"]
ARCHIVO_FIN

cat > index.js <<'ARCHIVO_FIN'
// Montaje personal persistente de Legado de Hierro.
// HTTP only records the request and starts a Cloud Run Job. The job measures
// narration, reuses cached scene segments and renders mixed images/videos at
// their natural speed, with looped music and subtitles. No media in HTTP bodies.
// A failed task persists its error and retries once; the phone can reconnect.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const {GoogleAuth} = require('google-auth-library');
const {fitTimeline,validateShots} = require('./timeline');

// VERSION DEL SERVICIO. Cambia cada vez que se toca este archivo, y la
// herramienta la compara con la que espera para decir sola si el Cloud Run que
// hay corriendo esta al dia o le falta la ultima actualizacion. Antes no habia
// forma de saberlo desde fuera y habia que preguntarlo, que es absurdo.
const VERSION = '2026-09-13.1';

const PORT = process.env.PORT || 8080;
// Sin nombres de respaldo: el bucket SIEMPRE viene de la variable BUCKET del despliegue.
const BUCKET = (process.env.BUCKET || '').replace('gs://', '').replace(/\/.*$/, '');
const UNIFY_KEY = process.env.UNIFY_KEY || '';
const storage = new Storage();

function run(cmd, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs || 240000, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(cmd + ' fallo: ' + (stderr || err.message).slice(-800)));
      resolve({ stdout, stderr });
    });
  });
}

async function probeDuration(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ]);
  const d = parseFloat(String(stdout).trim());
  if (!isFinite(d) || d <= 0) throw new Error('No se pudo medir la duracion de ' + path.basename(file));
  return d;
}

// Tamano real del video. Hace falta porque el paso de concatenar usa "-c copy":
// si se mezclan clips de distinta resolucion (algo perfectamente posible trayendo
// clips del banco generados con otro aspecto), el resultado es un archivo roto
// SIN que ffmpeg avise, y el trabajo se marcaba igualmente como terminado.
async function probeSize(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0:s=x', file,
  ]);
  const m = /(\d+)x(\d+)/.exec(String(stdout).trim());
  if (!m) throw new Error('No se pudo medir el tamano de ' + path.basename(file));
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

// Los subtitulos llegan como SRT. Se escriben a fichero y se queman con el filtro
// "subtitles". Hay que escapar la ruta: en el grafo de filtros de ffmpeg, los ":"
// y las "," separan argumentos.
function rutaParaFiltro(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

// Estilo de los subtitulos, como linea "Style:" de ASS.
//
// OJO CON LAS UNIDADES, que es donde esto falla en silencio: los valores de un
// estilo ASS NO estan en pixeles del video, sino en el espacio de referencia que
// declara el propio fichero (PlayResX/PlayResY). Cuando ffmpeg convierte un SRT
// pone 384x288 por defecto, asi que un MarginV calculado sobre 1920 empuja el
// texto fuera de la pantalla y el video sale SIN subtitulos, sin ningun error.
// Por eso mas abajo se reescribe PlayRes al tamano real del video: asi estos
// numeros si son pixeles de verdad y se pueden razonar.
//
// Blanco, negrita, borde negro grueso y sombra: se lee sobre cualquier imagen.
// El margen inferior deja libre la franja donde Facebook pone sus botones.
function estiloSubs(alto) {
  const fs = Math.round(alto * 0.045);          // ~86 px con 1920 de alto
  const margen = Math.round(alto * 0.17);       // despeja la interfaz de Reels
  const outline = Math.max(3, Math.round(fs * 0.09));
  const sombra = Math.max(1, Math.round(fs * 0.03));
  // Orden de los campos del formato V4+ (no se puede alterar):
  // Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,
  // Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,
  // Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
  return 'Style: Default,DejaVu Sans,' + fs + ',&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,'
    + '-1,0,0,0,100,100,0,0,1,' + outline + ',' + sombra + ',2,60,60,' + margen + ',1';
}

// Convierte el SRT en un ASS con la resolucion de referencia del VIDEO REAL y
// con nuestro estilo. Devuelve la ruta del .ass listo para el filtro.
async function prepararSubs(dir, srt, ancho, alto) {
  const srtFile = path.join(dir, 'subs.srt');
  fs.writeFileSync(srtFile, String(srt), 'utf8');
  const assFile = path.join(dir, 'subs.ass');
  // ffmpeg hace la conversion de formato; nosotros solo corregimos cabecera y estilo.
  await run('ffmpeg', ['-y', '-i', srtFile, assFile], 60000);
  let ass = fs.readFileSync(assFile, 'utf8');
  ass = ass.replace(/PlayResX:\s*\d+/, 'PlayResX: ' + ancho)
           .replace(/PlayResY:\s*\d+/, 'PlayResY: ' + alto)
           .replace(/^Style: Default,.*$/m, estiloSubs(alto));
  // Si alguna de las dos sustituciones no encajo, mejor fallar aqui que entregar
  // un video sin subtitulos creyendo que los lleva.
  if (ass.indexOf('Style: Default,DejaVu Sans,') < 0) throw new Error('No se pudo aplicar el estilo al ASS');
  if (ass.indexOf('PlayResY: ' + alto) < 0) throw new Error('No se pudo fijar PlayRes en el ASS');
  fs.writeFileSync(assFile, ass, 'utf8');
  return assFile;
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudo descargar un clip (HTTP ' + r.status + '). Puede que la URL firmada haya expirado: regenera los videos e intenta de nuevo.');
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error('Un clip llego vacio o corrupto.');
  fs.writeFileSync(dest, buf);
}

async function writeStatus(jobId, obj) {
  await storage.bucket(BUCKET).file('unify/' + jobId + '.json')
    .save(JSON.stringify(obj), { contentType: 'application/json' });
}

// IMAGEN FIJA -> CLIP CON MOVIMIENTO (respaldo cuando no hay creditos para Veo).
//
// Una imagen quieta durante 8 segundos mata la retencion: parece una diapositiva.
// Aqui se le da un acercamiento lento y una deriva suave (lo que en television
// llaman "Ken Burns"), que es lo que hace que se vea como plano de cine y no
// como una foto pegada.
//
// COMO SE HACE, y por que asi: el filtro zoompan trabaja fotograma a fotograma y
// si se aplica directo sobre la imagen final el borde "tiembla" (salta de pixel
// en pixel). Por eso primero se AMPLIA la imagen 4x, se hace el movimiento sobre
// esa version grande, y se reduce al tamano final: el temblor queda por debajo
// del pixel y el movimiento sale liso.
async function imagenAClip(imgFile, salida, segundos, ancho, alto, indice) {
  const FPS = 30;
  const frames = Math.max(2, Math.round(segundos * FPS));
  const SUP = 4;                                   // factor de sobremuestreo
  const zoomFinal = 1.14;                          // 14% de acercamiento total
  const paso = (zoomFinal - 1) / frames;
  // Se alterna el sentido para que dos imagenes seguidas no se muevan igual.
  const modo = indice % 4;
  const zExpr = (modo === 1 || modo === 3)
    ? ('max(' + zoomFinal.toFixed(4) + '-on*' + paso.toFixed(8) + ',1.0)')  // alejarse
    : ('min(1.0+on*' + paso.toFixed(8) + ',' + zoomFinal.toFixed(4) + ')'); // acercarse
  // Deriva suave hacia un lado, distinta segun el indice.
  const xs = ['iw/2-(iw/zoom/2)', 'iw/2-(iw/zoom/2)+(on/' + frames + ')*(iw*0.04)',
              'iw/2-(iw/zoom/2)-(on/' + frames + ')*(iw*0.04)', 'iw/2-(iw/zoom/2)'];
  const ys = ['ih/2-(ih/zoom/2)-(on/' + frames + ')*(ih*0.03)', 'ih/2-(ih/zoom/2)',
              'ih/2-(ih/zoom/2)', 'ih/2-(ih/zoom/2)+(on/' + frames + ')*(ih*0.03)'];
  const vf = 'scale=' + (ancho * SUP) + ':' + (alto * SUP)
    + ':force_original_aspect_ratio=increase,crop=' + (ancho * SUP) + ':' + (alto * SUP) + ','
    + "zoompan=z='" + zExpr + "':x='" + xs[modo] + "':y='" + ys[modo] + "'"
    + ':d=' + frames + ':s=' + ancho + 'x' + alto + ':fps=' + FPS
    + ',setsar=1';
  await run('ffmpeg', ['-y', '-loop', '1', '-i', imgFile, '-frames:v', String(frames),
    '-vf', vf, '-r', String(FPS), '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', salida,
  ], 300000);
}

async function processJob(jobId, payload) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unify-'));
  const {shots,audioObjects,music,srt,targetSeconds:objetivoSeg,aspect} = payload;
  const progress = async stage=>writeStatus(jobId,{status:'running',stage,updatedAt:new Date().toISOString()});
  try {
    await progress('Preparando la narración guardada');
    const partFiles=[];
    for(let i=0;i<audioObjects.length;i++){
      const source=path.join(dir,'source-audio-'+i);
      await storage.bucket(BUCKET).file(audioObjects[i]).download({destination:source});
      const normalized=path.join(dir,'audio-'+i+'.wav');
      await run('ffmpeg',['-y','-i',source,'-ar','48000','-ac','2','-c:a','pcm_s16le',normalized]);
      partFiles.push(normalized);fs.rmSync(source,{force:true});
    }
    // Concat preserves every sample. Crossfading narration shortened each boundary
    // and accumulated a subtitle offset in long episodes.
    const audioList=path.join(dir,'audio-list.txt');
    fs.writeFileSync(audioList,partFiles.map(f=>"file '"+f+"'").join('\n'));
    const audioFull=path.join(dir,'narracion.wav');
    await run('ffmpeg',['-y','-f','concat','-safe','0','-i',audioList,'-c:a','pcm_s16le',audioFull]);
    for(const f of partFiles)fs.rmSync(f,{force:true});
    const audioDur=await probeDuration(audioFull),timeline=fitTimeline(shots,audioDur);
    const destino=aspect==='16:9'?{w:1280,h:720}:aspect==='1:1'?{w:1080,h:1080}:aspect==='4:5'?{w:864,h:1080}:{w:720,h:1280};
    const factor=1,totalVideo=audioDur,scaled=[],sources=new Map();
    const encaje='scale='+destino.w+':'+destino.h+':force_original_aspect_ratio=increase,crop='+destino.w+':'+destino.h+',setsar=1';
    for(let i=0;i<timeline.length;i++){
      const shot=timeline[i];await progress('Montando toma '+(i+1)+' de '+timeline.length);
      const out=path.join(dir,'scaled'+i+'.mp4');
      const cacheKey=crypto.createHash('sha256').update(JSON.stringify({v:VERSION,...shot,aspect})).digest('hex');
      const cached=storage.bucket(BUCKET).file('unify/parts/'+jobId+'/'+cacheKey+'.mp4');
      if((await cached.exists())[0]){await cached.download({destination:out});scaled.push(out);continue;}
      let source=sources.get(shot.object);
      if(!source){source=path.join(dir,'source-'+i+(shot.kind==='image'?'.png':'.mp4'));await storage.bucket(BUCKET).file(shot.object).download({destination:source});sources.set(shot.object,source);}
      if(shot.kind==='image')await imagenAClip(source,out,shot.duration,destino.w,destino.h,i);
      else{
        // Keep the natural motion. Trim a long clip, loop a short one; never
        // slow an 8-second gesture down to fill an entire minute.
        await run('ffmpeg',['-y','-stream_loop','-1','-i',source,'-t',shot.duration.toFixed(6),'-vf',encaje,'-r','30','-frames:v',String(shot.frames),'-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',out]);
      }
      await cached.save(fs.readFileSync(out),{contentType:'video/mp4'});scaled.push(out);
    }
    await progress('Uniendo las tomas y preparando los subtítulos');

    // 6. Concatenar en orden
    const listFile = path.join(dir, 'list.txt');
    fs.writeFileSync(listFile, scaled.map(f => "file '" + f + "'").join('\n'));
    let joined = path.join(dir, 'joined.mp4');
    await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', joined]);

    // 6b. SUBTITULOS QUEMADOS. En Facebook la mayoria mira SIN sonido: si en los
    //     primeros segundos no hay texto en pantalla, se van antes de oir nada.
    //     Los tiempos por caracter de ElevenLabs ya se calculan en el navegador y
    //     hasta ahora solo acababan en un .srt suelto dentro del ZIP; el reel tenia
    //     que pasar por CapCut solo por esto. Aqui se queman de una vez.
    //     Obliga a reencodear el video en ESTE paso (antes era copy), pero el paso 7
    //     ya no reencodea video, asi que sigue habiendo un solo encode de video.
    let subsPuestos = false;
    if (srt && String(srt).trim()) {
      const conSubs = path.join(dir, 'joined_subs.mp4');
      try {
        const assFile = await prepararSubs(dir, srt, destino.w, destino.h);
        const filtro = 'ass=' + rutaParaFiltro(assFile);
        await run('ffmpeg', ['-y', '-i', joined, '-vf', filtro,
          '-r', '30', '-an',
          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
          '-pix_fmt', 'yuv420p', conSubs,
        ], 420000);
        joined = conSubs;
        subsPuestos = true;
      } catch (e) {
        // Si el quemado falla (una fuente que no esta, un SRT mal formado), NO se
        // tira el trabajo entero: sale el video sin subtitulos y se avisa en el
        // estado. Perder el reel por los subtitulos seria peor que no tenerlos.
        console.warn('[' + jobId + '] no se pudieron quemar los subtitulos: ' + e.message);
      }
    }

    // 7. Pegar la narracion encima — y, si se pidio, la MUSICA DE FONDO debajo.
    //    Codificacion AAC UNA sola vez (256k), a partir del WAV sin perdida.
    const finalFile = path.join(dir, 'final.mp4');
    // Ajustes de codec de audio compartidos por ambos caminos: un solo encode AAC-LC 256k.
    const AAC = ['-c:a', 'aac', '-b:a', '256k', '-profile:a', 'aac_low', '-ar', '48000', '-ac', '2'];
    // NIVELADO al estandar de redes (-14 LUFS). Sin esto, dos reels seguidos salen
    // a volumenes distintos segun el motor de voz que se uso (ElevenLabs, Gemini-TTS
    // y Chirp no coinciden), y Facebook aplica su propia normalizacion encima, que
    // castiga al que llega bajo. Con esto todos los reels suenan igual de fuertes.
    const LOUDNORM = 'loudnorm=I=-14:TP=-1:LRA=11';
    if (music && music.object) {
      const musicSrc = path.join(dir, 'music_src' + path.extname(music.object || '.mp3'));
      try {
        await storage.bucket(BUCKET).file(music.object).download({ destination: musicSrc });
      } catch (e) {
        throw new Error('No se pudo descargar la musica "' + music.object + '" del bucket: ' + e.message);
      }
      let vol = Number(music.volume);
      if (!isFinite(vol) || vol < 0 || vol > 1) vol = 0.18;
      // Pre: musica -> WAV 48k estereo (PCM, sin perdida).
      const musicWav = path.join(dir, 'music_wav.wav');
      await run('ffmpeg', ['-y', '-i', musicSrc,
        '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', musicWav]);

      // CAMA DE MUSICA SIN COSTURA. Antes se repetia con -stream_loop, que pega
      // copia tras copia: en cada vuelta el final chocaba de golpe con el inicio y
      // se oia un corte seco. Ahora se mide la narracion y se arma la musica al
      // largo justo, uniendo cada repeticion con un CROSSFADE (fundido cruzado),
      // asi nunca hay un corte. Al final, un fundido de salida para que no se corte
      // en seco cuando termina el video.
      const narDur = await probeDuration(audioFull);
      const musDur = await probeDuration(musicWav);
      const musicBed = path.join(dir, 'music_bed.wav');
      const X = Math.min(2, Math.max(0.5, musDur / 3)); // segundos de crossfade
      const need = narDur + 1.0;                        // cubrir todo el video con margen
      const fadeOutD = Math.min(1.5, musDur / 2);
      const fadeStart = Math.max(0, narDur - fadeOutD);
      const fadeOut = 'afade=t=out:st=' + fadeStart.toFixed(2) + ':d=' + fadeOutD.toFixed(2);

      if (musDur >= need) {
        await run('ffmpeg',['-y','-i',musicWav,'-t',narDur.toFixed(3),'-af',fadeOut,'-c:a','pcm_s16le',musicBed]);
      } else {
        // Build one seamless loop, then stream it for the measured duration.
        // Unlike a capped list of 12 copies, this covers 8 minutes or an hour.
        const loop=path.join(dir,'music-loop.wav');
        const cross=Math.min(2,musDur/4);
        await run('ffmpeg',['-y','-i',musicWav,'-i',musicWav,'-filter_complex',
          '[0:a][1:a]acrossfade=d='+cross.toFixed(4)+':c1=tri:c2=tri,atrim=start='+cross.toFixed(4)+':end='+musDur.toFixed(4)+',asetpts=PTS-STARTPTS[loop]',
          '-map','[loop]','-c:a','pcm_s16le',loop]);
        // Crossfade the tail of a copy with the next head, then take exactly
        // one cyclic period beginning after that head; the join is continuous.
        await run('ffmpeg',['-y','-stream_loop','-1','-i',loop,'-t',narDur.toFixed(3),'-af',fadeOut,'-c:a','pcm_s16le',musicBed]);
      }

      // Mezcla: voz al 100% + musica a VOL. amix normalize=0 evita que la voz se
      // baje a la mitad; alimiter (-1 dBFS, con lookahead) impide cualquier
      // recorte por picos SIN el escalon del hard-clip => sin distorsion ni clicks.
      const fc =
        '[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=1.0[nar];' +
        // LA MUSICA, APLANADA ANTES DE MEZCLARLA.
        //
        // Una pieza generada tiene su dinamica: pasajes suaves y subidas. Como
        // musica de fondo eso es un problema — en las subidas tapa la voz, y si
        // se baja el volumen para que no la tape, en los pasajes suaves no se
        // oye. No hay volumen manual que valga para las dos cosas.
        //
        // dynaudnorm empareja el nivel a lo largo de toda la pieza (ventana de
        // ~3 s, sin bombear), acompressor recorta lo que aun sobresalga y
        // loudnorm la deja en un nivel conocido antes de aplicar el volumen
        // elegido. Resultado: la musica suena igual de presente todo el rato y
        // el volumen que se elige significa lo mismo de principio a fin.
        '[2:a]aformat=sample_fmts=fltp:channel_layouts=stereo,' +
        'dynaudnorm=f=250:g=15:p=0.9:m=8:r=0.9:s=12,' +
        'acompressor=threshold=0.1:ratio=4:attack=20:release=250:makeup=1,' +
        'loudnorm=I=-24:TP=-6:LRA=3,' +
        'volume=' + vol.toFixed(3) + '[mus];' +
        '[nar][mus]amix=inputs=2:duration=first:normalize=0:dropout_transition=0[premix];' +
        '[premix]alimiter=level=0:limit=0.891:attack=5:release=50:asc=1,' + LOUDNORM + '[a]';
      await run('ffmpeg', ['-y', '-i', joined, '-i', audioFull, '-i', musicBed,
        '-filter_complex', fc,
        '-map', '0:v:0', '-map', '[a]',
        '-c:v', 'copy'].concat(AAC, [
        '-movflags', '+faststart', '-shortest', finalFile,
      ]));
    } else {
      // Sin musica: video + narracion WAV -> UN encode AAC 256k (antes eran 2 encodes).
      await run('ffmpeg', ['-y', '-i', joined, '-i', audioFull,
        '-filter_complex', '[1:a]' + LOUDNORM + '[a]',
        '-map', '0:v:0', '-map', '[a]',
        '-c:v', 'copy'].concat(AAC, [
        '-movflags', '+faststart', '-shortest', finalFile,
      ]));
    }

    // 8. CONTROL DE CALIDAD. Antes el MP4 salia de aqui y se ofrecia para descargar
    //    sin comprobar NADA: si algo habia salido mal, el estado decia "done"
    //    igualmente. Ahora se mide el archivo terminado y los avisos viajan con el
    //    resultado, para que no se publique un reel roto sin darse cuenta.
    const avisos = [];
    const finalSize = await probeSize(finalFile);
    const finalDur = await probeDuration(finalFile);
    if (aspect==='9:16' && finalSize.w > finalSize.h) {
      avisos.push('El video salio horizontal (' + finalSize.w + 'x' + finalSize.h + '). Para Reels tiene que ser vertical.');
    }
    // La imagen y el sonido tienen que durar lo mismo: si no, hay un trozo mudo
    // al final o la voz se corta.
    if (Math.abs(finalDur - audioDur) > 1.0) {
      avisos.push('La imagen dura ' + finalDur.toFixed(1) + 's y la narracion ' + audioDur.toFixed(1) + 's.');
    }
    // Duracion objetivo (30 o 60 s): si se pasa mucho, el reel no encaja.
    const obj = Number(objetivoSeg);
    if (isFinite(obj) && obj > 0 && Math.abs(finalDur - obj) / obj > 0.15) {
      avisos.push('Dura ' + finalDur.toFixed(1) + 's y el objetivo eran ' + obj + 's.');
    }
    if (srt && String(srt).trim() && !subsPuestos) {
      avisos.push('No se pudieron quemar los subtitulos; el video sale sin ellos.');
    }
    if (avisos.length) console.warn('[' + jobId + '] avisos de calidad: ' + avisos.join(' | '));

    // Subir el resultado y marcar el trabajo como terminado
    const object = 'unify/' + jobId + '.mp4';
    await storage.bucket(BUCKET).upload(finalFile, {
      destination: object,
      metadata: { contentType: 'video/mp4' },
    });
    await writeStatus(jobId, {
      status: 'done',
      object: object,
      factor: Number(factor.toFixed(4)),
      videoSeconds: Number(totalVideo.toFixed(2)),
      audioSeconds: Number(audioDur.toFixed(2)),
      // Datos del archivo REAL que se subio, no de lo que se pretendia hacer.
      ancho: finalSize.w, alto: finalSize.h,
      duracion: Number(finalDur.toFixed(2)),
      subtitulos: subsPuestos,
      avisos: avisos,
    });
    console.log('[' + jobId + '] listo: ' + object + ' (factor ' + factor.toFixed(3) + ')');
  } catch (e) {
    // El error NUNCA se pierde: queda en el bucket y Vercel lo registra al leerlo.
    console.error('[' + jobId + '] error: ' + e.message);
    try { await writeStatus(jobId, { status: 'error', message: e.message,updatedAt:new Date().toISOString() }); } catch (e2) {
      console.error('[' + jobId + '] no se pudo escribir el estado de error: ' + e2.message);
    }
    throw e;
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
}

// A Cloud Run Job executes to completion independently of HTTP and the phone.
// Both the request and every finished visual segment are persisted in GCS.
const auth = new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
async function runWorker(jobId){
  if(!/^job-[a-f0-9]{24}$/.test(jobId))throw new Error('jobId inválido');
  const bucket=storage.bucket(BUCKET),state=bucket.file('unify/'+jobId+'.json');
  try{const [raw]=await state.download();if(JSON.parse(raw).status==='done')return;}catch(e){if(e.code!==404)throw e;}
  const lock=bucket.file('unify/locks/'+jobId+'.json');
  let generation=0;
  try{
    const [meta]=await lock.getMetadata();generation=meta.generation;
    const [raw]=await lock.download();const lease=JSON.parse(raw);
    if(lease.until>Date.now() && lease.execution!==(process.env.CLOUD_RUN_EXECUTION || 'local'))return;
  }catch(e){if(e.code!==404)throw e;}
  try{await lock.save(JSON.stringify({execution:process.env.CLOUD_RUN_EXECUTION || 'local',until:Date.now()+3700000}),{contentType:'application/json',preconditionOpts:{ifGenerationMatch:generation}});}catch(e){if(e.code===412)return;throw e;}
  try{
    const [raw]=await bucket.file('unify/requests/'+jobId+'.json').download();
    await processJob(jobId,JSON.parse(raw));
  }finally{await lock.delete().catch(()=>{});}
}
async function startJob(data){
  validateShots(data.shots);
  if(!Array.isArray(data.audioObjects)||!data.audioObjects.length||data.audioObjects.length>200||!data.audioObjects.every(o=>typeof o==='string'&&/^legado-studio\/media\//.test(o)&&!o.includes('..')))throw new Error('Referencias de audio inválidas');
  if(!['9:16','16:9','1:1','4:5'].includes(data.aspect))throw new Error('Formato inválido');
  if(data.music&&(!/^musica\//.test(data.music.object)||data.music.object.includes('..')))throw new Error('Música inválida');
  const resource=process.env.RENDER_JOB_RESOURCE;
  if(!/^projects\/[^/]+\/locations\/[^/]+\/jobs\/[^/]+$/.test(resource || ''))throw new Error('Falta instalar el ejecutor de montaje. Ejecuta el actualizador de Cloud Run de esta versión.');
  const jobId='job-'+crypto.createHash('sha256').update(JSON.stringify({version:VERSION,...data})).digest('hex').slice(0,24);
  const bucket=storage.bucket(BUCKET),state=bucket.file('unify/'+jobId+'.json');
  try{const [raw]=await state.download(),d=JSON.parse(raw);if(d.status==='done'||(d.status==='running'&&Date.now()-Date.parse(d.updatedAt)<3700000)||(d.status==='queued'&&Date.now()-Date.parse(d.updatedAt)<90000))return jobId;}catch(e){if(e.code!==404)throw e;}
  const request=bucket.file('unify/requests/'+jobId+'.json');
  try{await request.save(JSON.stringify(data),{contentType:'application/json',preconditionOpts:{ifGenerationMatch:0}});}catch(e){if(e.code!==412)throw e;}
  await writeStatus(jobId,{status:'queued',stage:'Montaje en cola',updatedAt:new Date().toISOString()});
  try{
    const client=await auth.getClient();
    await client.request({url:'https://run.googleapis.com/v2/'+resource+':run',method:'POST',timeout:15000,data:{overrides:{containerOverrides:[{env:[{name:'LH_JOB_ID',value:jobId}]}]}}});
  }catch(e){await writeStatus(jobId,{status:'error',message:'No se pudo arrancar el ejecutor de montaje. '+e.message,updatedAt:new Date().toISOString()});throw e;}
  return jobId;
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.method==='GET'&&req.url==='/')return res.end(JSON.stringify({ok:true,service:'legado-unify',version:VERSION,durable:!!process.env.RENDER_JOB_RESOURCE}));
  if(req.method!=='POST'||req.url!=='/start'){res.statusCode=404;return res.end(JSON.stringify({error:'Ruta desconocida'}));}
  const supplied=Buffer.from(String(req.headers['x-unify-key']||'')),expected=Buffer.from(UNIFY_KEY);
  if(!UNIFY_KEY||supplied.length!==expected.length||!crypto.timingSafeEqual(supplied,expected)){res.statusCode=401;return res.end(JSON.stringify({error:'Clave inválida'}));}
  try{
    let size=0,body=[];for await(const c of req){size+=c.length;if(size>2*1024*1024)throw new Error('El montaje debe enviar referencias, no archivos');body.push(c);}
    const data=JSON.parse(Buffer.concat(body).toString());const jobId=await startJob(data);res.end(JSON.stringify({jobId}));
  }catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}));}
});
if(require.main===module){
  if(process.env.LH_JOB_ID)runWorker(process.env.LH_JOB_ID).then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1);});
  else server.listen(PORT,()=>console.log('legado-unify '+VERSION+' escuchando en '+PORT));
}
module.exports={processJob,runWorker,startJob,server,fitTimeline,imagenAClip,prepararSubs,probeDuration,probeSize};
ARCHIVO_FIN

cat > timeline.js <<'ARCHIVO_FIN'
'use strict';
function validateShots(shots) {
  if (!Array.isArray(shots) || !shots.length || shots.length > 600) throw new Error('El montaje necesita entre 1 y 600 tomas.');
  for (const s of shots) {
    if (!s || !['image','video'].includes(s.kind) || typeof s.object !== 'string' || !s.object || s.object.includes('..') || /[\x00-\x1f\\]/.test(s.object)) throw new Error('Referencia de toma inválida.');
    if (!Number.isFinite(Number(s.duration)) || Number(s.duration) < 0.1 || Number(s.duration) > 120) throw new Error('Duración de toma inválida.');
  }
}
function fitTimeline(shots,audioSeconds,fps) {
  validateShots(shots);fps=fps||30;
  if (!(audioSeconds>0) || audioSeconds>7200) throw new Error('Duración de narración inválida.');
  const total=shots.reduce((n,s)=>n+Number(s.duration),0),frames=Math.round(audioSeconds*fps);
  if(frames<shots.length)throw new Error('Hay más tomas que fotogramas disponibles.');
  let acc=0,previous=0;
  return shots.map((s,i)=>{
    acc+=Number(s.duration);
    const end=i===shots.length-1?frames:Math.max(previous+1,Math.min(frames-(shots.length-i-1),Math.round(acc/total*frames)));
    const result={...s,start:previous/fps,duration:(end-previous)/fps,frames:end-previous};previous=end;return result;
  });
}
module.exports={validateShots,fitTimeline};
ARCHIVO_FIN

gcloud run deploy legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --source . \
  --memory 2Gi --cpu 2 --timeout 300 --cpu-throttling --min-instances 0 --max-instances 1 --quiet
LEGADO_REVISION=$(gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.latestReadyRevisionName)')
LEGADO_IMAGE=$(gcloud run revisions describe "$LEGADO_REVISION" --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.imageDigest)')
gcloud run jobs deploy legado-render --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --image "$LEGADO_IMAGE" \
  --service-account "$LEGADO_SERVICE_ACCOUNT" --memory 2Gi --cpu 2 --tasks 1 --parallelism 1 \
  --task-timeout 3600s --max-retries 1 --set-env-vars "BUCKET=$LEGADO_BUCKET" --quiet
gcloud run jobs add-iam-policy-binding legado-render --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
  --member "serviceAccount:$LEGADO_SERVICE_ACCOUNT" --role roles/run.jobsExecutorWithOverrides --quiet >/dev/null
gcloud run services update legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
  --update-env-vars "RENDER_JOB_RESOURCE=projects/$LEGADO_PROJECT_ID/locations/$LEGADO_REGION/jobs/legado-render" --quiet
printf '\nMontaje actualizado. El ejecutor se ha instalado sin iniciar ninguna generación.\n'
