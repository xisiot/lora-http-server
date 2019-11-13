# Document

## Introduction

HTTP API document

### Params(defaul和?处无法确定)
| param | description | value  
| :- | :- | :-
| class-1 | |
|`userID`|User's ID.|Hex. Size: 32|
|`email`|User's email.|default|
|`password`|User's password.|default|
| class-2 | |
|`name`|Name of the record.|String. Size: [1,32]|
|`description`|Description of the record.|String. Size: [1,128]|
|`from`|Page number.|default|
|`size`|Page size.|default|
|`message`|Extra message.|default|
| class-3 | |
|`AppEUI`|Application identifier.|Hex. Size: 16|
|`DevEUI`|End-device identifier.|Hex. Size: 16|
|`AppKey`|Application key. An AES-128 root key specific to the end-device.|Hex. Size: 32|
|`ProtocolVersion`|?|default|
|`activationMode`|Over-The-Air Activation (OTAA) or Activation By Personalization (ABP).|default|
|`DevAddr`|End-device address. The DevAddr consists of 32 bits identifies the end-device within the current network.|Hex. Size: 8|
|`AppSKey`|Application session key. An application session key specific for the end-device.|Hex. Size: 32|
|`NwkSKey`|Network session key. A network session key specific for the end-device.|Hex. Size: 32|
|`DevNonce`|A random value of 2 octets. |Hex. Size: 4|
|`frequencyPlan`|Frequency plan|String. Size: [1,11]|
|`ADR`| Adaptive data rate.|?|
|`ChMask`|The channel mask.|?|
|`CFList`|List of channel frequencies.|?|
|`ChDrRange`|Chanel data-rate range.|?|
|`RX1CFList`|List of channel frequencies of the first receive window.|?|
|`RX2Freq`|The fixed frequency of the second receive window.|?|
|`MaxEIRP`|Maximum allowed end-device Effective Isotropic Radiated Power|?|
| class-4 | |
|`gatewayID`|Gateway's ID.|Hex. Size: 16|
|`type`|Gateway type.|indoor or outdoor.|
|`location`|location of the gateway.|default|
|`model`|?|?|

### Code

| code | message
| :- | :-
| invalid param |
| 2101 | "invalid emailr"
| 2102 | "invalid password"
| 2103 | "invalid AppEUI"
| 2104 | "invalid DevEUI"
| 2105 | "invalid AppKey"
| 2107 | "invalid DevAddr"
| 2108 | "invalid MACCommand"
| 2109 | "invalid Downlink"
| 2110 | "invalid gatewayId"
| 2111 | "invalid userID"
| 2112 | "invalid name"
| 2113 | "invalid protoBuf"
| 2114 | "invalid ProtocolVersion"
| 2115 | "invalid activationMode"
| 2116 | "invalid description"
| 2117 | "invalid AppSKey"
| 2118 | "invalid NwkSKey"
| 2119 | "invalid DevNonce"
| 2120 | "invalid frequencyPlan"
| 2121 | "invalid ADR"
| 2122 | "invalid ChMask"
| 2123 | "invalid CFList"
| 2124 | "invalid ChDrRange"
| 2125 | "invalid RX1CFList"
| 2126 | "invalid RX2Freq"
| 2127 | "invalid RX2DataRate"
| 2128 | "invalid MaxEIRP"
| 2129 | "invalid message"
| param required |
| 3104 | "userID required"
| 3105 | "email required"
| 3106 | "password required"
| 3107 | "AppEUI required"
| 3108 | "name required"
| 3109 | "DevEUI required"
| 3110 | "AppKey required"
| 3112 | "DevAddr required"
| 3113 | "MACCommand required"
| 3114 | "Downlink required"
| 3115 | "activationMode required"
| 3116 | "gatewayId required"
| 3117 | "protoBuf required"
| 3118 | "AppKey required"
| 3119 | "ProtocolVersion required"
| 3120 | "a required"
| 3121 | "description required"
| 3122 | "AppSKey required"
| 3123 | "NwkSKey required"
| 3124 | "DevNonce required"
| 3125 | "frequencyPlan required"
| 3126 | "ADR required"
| 3127 | "ChMask required"
| 3128 | "CFList required"
| 3129 | "ChDrRange required"
| 3130 | "RX1CFList required"
| 3131 | "RX2Freq required"
| 3132 | "RX2DataRate required"
| 3133 | "MaxEIRP required"
| 3134 | "message required"
| other code |
| 3101 | "user already registered"
| 3102 | "user not registered"
| 3103 | "user password error"
| 3201 | "application already created"
| 3202 | "application not created"
| 3203 | "name already created"
| 3204 | "repeated AppEUI"
| 3301 | "device already created"
| 3401 | "gateway already created"
| 4001 | "No such item"
