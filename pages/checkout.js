import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'

// Nigerian States and LGAs data
const NIGERIAN_STATES = [
  'Abuja (FCT)', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
]

const STATE_LGAS = {
  'Abuja (FCT)': ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
  'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umu Nneochi', 'Umuahia North', 'Umuahia South'],
  'Adamawa': ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
  'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  'Benue': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'],
  'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  'Edo': ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon', 'Oredo', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
  'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
  'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'],
  'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa-Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Muya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Sagamu', 'Yewa North', 'Yewa South'],
  'Ondo': ['Akoko North East', 'Akoko North West', 'Akoko South Akure East', 'Akoko South West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  'Osun': ['Aiyedaade', 'Aiyedire', 'Atakunmosa East', 'Atakunmosa West', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesha East', 'Ilesha West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau': ['Barikin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'],
  'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tqngaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kurmi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Karawa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi']
}

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [deliveryMessage, setDeliveryMessage] = useState('Loading...')
  const [deliveryMethod, setDeliveryMethod] = useState('delivery') // 'delivery' or 'pickup'
  const [selectedPickupAddress, setSelectedPickupAddress] = useState(null)
  const [pickupAddresses, setPickupAddresses] = useState([])
  const [selfPickupEnabled, setSelfPickupEnabled] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromos, setAppliedPromos] = useState([])
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoMessage, setPromoMessage] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    address: ''
  })

  // Check authentication and pre-fill form
  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth !== 'true' && userAuth !== 'guest') {
      router.push('/signin?returnUrl=/checkout')
      return
    }

    // Pre-fill user data if available (not for guest)
    if (userData && userAuth === 'true') {
      const user = JSON.parse(userData)
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }

    // Fetch delivery settings to check if self-pickup is enabled
    const fetchDeliverySettings = async () => {
      try {
        const res = await fetch('/api/delivery-settings')
        const data = await res.json()
        console.log('Checkout - delivery settings response:', data)
        if (data.success && data.settings) {
          console.log('Self pickup enabled:', data.settings.selfPickupEnabled)
          console.log('Free threshold:', data.settings.freeThreshold)
          setSelfPickupEnabled(data.settings.selfPickupEnabled || false)
          // For testing: enable self pickup by default if no addresses exist
          if (!data.settings.selfPickupEnabled && (!data.settings.pickupAddresses || data.settings.pickupAddresses.length === 0)) {
            setSelfPickupEnabled(true) // Enable for testing
          }
          setPickupAddresses(data.settings.pickupAddresses || [])
          // Set initial delivery fee to default instead of 0
          if (deliveryMethod === 'delivery') {
            setDeliveryFee(data.settings.defaultFee || 2000)
            setDeliveryMessage('Select delivery address for accurate pricing')
          }
        }
      } catch (err) {
        console.error('Failed to fetch delivery settings', err)
      }
    }
    fetchDeliverySettings()
  }, [router])

  // Update delivery fee when delivery method changes
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setDeliveryFee(0)
      setDeliveryMessage('Self Pickup - FREE')
    } else if (formData.state || formData.city) {
      fetchDeliveryFee(formData.state, formData.city)
    }
  }, [deliveryMethod])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // If state changes, reset city
    if (name === 'state') {
      setFormData(prev => ({ ...prev, city: '' }))
    }

    // Recalculate delivery fee when state or city changes (only if delivery method is delivery)
    if ((name === 'state' || name === 'city') && deliveryMethod === 'delivery') {
      const newFormData = { ...formData, [name]: value }
      if (name === 'state') newFormData.city = '' // Reset city when state changes
      fetchDeliveryFee(newFormData.state, newFormData.city)
    }
  }

  const getLgasForState = (state) => {
    return STATE_LGAS[state] || ['Select a city/LGA']
  }

  // Fetch delivery fee based on location and cart total
  const fetchDeliveryFee = async (state, city) => {
    if (deliveryMethod === 'pickup') {
      setDeliveryFee(0)
      setDeliveryMessage('Self Pickup - FREE')
      return
    }

    try {
      const res = await fetch('/api/delivery-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, city, cartTotal: getCartTotal() })
      })
      const data = await res.json()
      if (data.success) {
        setDeliveryFee(data.fee)
        setDeliveryMessage(data.message)
      } else {
        // Fallback to default fee if API fails
        setDeliveryFee(2000)
        setDeliveryMessage('Standard delivery')
      }
    } catch (err) {
      console.error('Failed to fetch delivery fee', err)
      // Fallback to default fee
      setDeliveryFee(2000)
      setDeliveryMessage('Standard delivery')
    }
  }

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage('Please enter a promo code')
      return
    }

    // Check if promo is already applied
    if (appliedPromos.some(p => p.code.toUpperCase() === promoCode.toUpperCase())) {
      setPromoMessage('This promo code is already applied')
      return
    }

    setPromoLoading(true)
    setPromoMessage('')

    try {
      // Get user info for validation
      const userAuth = sessionStorage.getItem('user_authenticated')
      const userData = sessionStorage.getItem('user_data')
      let userId = null
      let userEmail = null
      
      if (userAuth === 'true' && userData) {
        const user = JSON.parse(userData)
        userId = user.id
        userEmail = user.email
      }

      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: promoCode, 
          cartTotal: getCartTotal(),
          userId,
          userEmail
        })
      })
      const data = await res.json()

      if (data.success) {
        // Check if this promo can combine with existing ones
        const canCombine = data.promo.canCombine !== false
        const hasNonCombinable = appliedPromos.some(p => p.canCombine === false)
        
        if (!canCombine && appliedPromos.length > 0) {
          setPromoMessage('This promo code cannot be combined with other promotions')
          return
        }
        
        if (hasNonCombinable && canCombine) {
          setPromoMessage('Cannot add this promo code with existing non-combinable promotions')
          return
        }

        setAppliedPromos([...appliedPromos, data.promo])
        setPromoMessage(data.message)
        setPromoCode('')
      } else {
        setPromoMessage(data.message)
      }
    } catch (err) {
      console.error('Failed to apply promo', err)
      setPromoMessage('Failed to apply promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = (index) => {
    setAppliedPromos(appliedPromos.filter((_, i) => i !== index))
    setPromoMessage('')
  }

  // Calculate final total with promo discount
  const getDiscountedTotal = () => {
    const subtotal = getCartTotal()
    const totalDiscount = appliedPromos.reduce((sum, promo) => sum + promo.discountAmount, 0)
    const hasFreeDelivery = appliedPromos.some(promo => promo.isFreeDelivery)
    const finalDeliveryFee = hasFreeDelivery ? 0 : deliveryFee
    return subtotal - totalDiscount + finalDeliveryFee
  }

  // Update delivery fee when cart total changes
  useEffect(() => {
    if ((formData.state || formData.city) && deliveryMethod === 'delivery') {
      fetchDeliveryFee(formData.state, formData.city)
    }
  }, [getCartTotal()])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    // Validate pickup address selection
    if (deliveryMethod === 'pickup' && pickupAddresses.length > 0 && !selectedPickupAddress) {
      alert('Please select a pickup location')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const finalTotal = getDiscountedTotal()
      
      // If total is ₦0, create order without payment
      if (finalTotal === 0) {
        const orderData = {
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          shipping: deliveryMethod === 'pickup' ? {
            address: selectedPickupAddress ? `${selectedPickupAddress.name} - ${selectedPickupAddress.address}` : 'Self Pickup',
            city: selectedPickupAddress ? selectedPickupAddress.city : 'Self Pickup',
            state: selectedPickupAddress ? selectedPickupAddress.state : 'Self Pickup',
            zipCode: '',
            pickupAddress: selectedPickupAddress
          } : {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: 0,
          deliveryFee,
          promoCodes: appliedPromos.map(p => p.code),
          promoDiscount: appliedPromos.reduce((sum, p) => sum + p.discountAmount, 0),
          deliveryMethod,
          status: 'Pending',
          paymentMethod: 'Free Order (100% Discount)',
          paymentReference: 'FREE_' + Date.now()
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        const data = await res.json()
        if (data.success) {
          clearCart()
          alert('🎉 Order placed successfully! Total: ₦0 (100% discount applied)')
          router.push('/profile')
        } else {
          alert('Failed to place order. Please try again.')
        }
        setLoading(false)
        return
      }
      
      // Handle Cash on Delivery
      if (formData.paymentMethod === 'cash_on_delivery') {
        // Create order directly without payment
        const orderData = {
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          shipping: deliveryMethod === 'pickup' ? {
            address: selectedPickupAddress ? `${selectedPickupAddress.name} - ${selectedPickupAddress.address}` : 'Self Pickup',
            city: selectedPickupAddress ? selectedPickupAddress.city : 'Self Pickup',
            state: selectedPickupAddress ? selectedPickupAddress.state : 'Self Pickup',
            zipCode: '',
            pickupAddress: selectedPickupAddress
          } : {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: getDiscountedTotal(),
          deliveryFee,
          promoCodes: appliedPromos.map(p => p.code),
          promoDiscount: appliedPromos.reduce((sum, p) => sum + p.discountAmount, 0),
          deliveryMethod,
          status: 'Pending',
          paymentMethod: 'Cash on Delivery',
          paymentReference: 'COD_' + Date.now()
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        const data = await res.json()
        if (data.success) {
          clearCart()
          alert('Order placed successfully! We will contact you to confirm delivery.')
          router.push('/profile')
        } else {
          alert('Failed to place order. Please try again.')
        }
        setLoading(false)
        return
      }

      // Use Paystack for payment
      if (formData.paymentMethod === 'paystack') {
        // Check if Paystack is available
        if (!window.PaystackPop) {
          alert('Payment system is not available. Please refresh the page and try again.')
          setLoading(false)
          return
        }

        const total = getDiscountedTotal() // Use discounted total
        const amount = total * 100 // Convert to kobo

        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_e025809d9568d6685a0f279c0903ca7d83c50685',
          email: formData.email,
          amount: amount,
          currency: 'NGN',
          ref: 'ORDER_' + Math.floor(Math.random() * 1000000000) + Date.now(),
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: `${formData.firstName} ${formData.lastName}`
              },
              {
                display_name: 'Phone',
                variable_name: 'phone',
                value: formData.phone
              },
              ...(appliedPromos.length > 0 ? [{
                display_name: 'Promo Codes',
                variable_name: 'promo_codes',
                value: appliedPromos.map(p => p.code).join(', ')
              }] : [])
            ],
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone
            },
            shipping: {
              address: deliveryMethod === 'pickup' ? 'Self Pickup' : formData.address,
              city: deliveryMethod === 'pickup' ? 'Self Pickup' : formData.city,
              state: deliveryMethod === 'pickup' ? 'Self Pickup' : formData.state,
              zipCode: deliveryMethod === 'pickup' ? '' : formData.zipCode
            },
            deliveryMethod,
            promoCodes: appliedPromos.map(p => p.code),
            promoDiscount: appliedPromos.reduce((sum, p) => sum + p.discountAmount, 0),
            cart: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            }))
          },
          callback: function(response) {
            // Payment successful
            verifyPayment(response.reference)
          },
          onClose: function() {
            setLoading(false)
            alert('Payment cancelled')
          }
        })

        handler.openIframe()
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (reference) => {
    try {
      const res = await fetch(`/api/verify-payment?reference=${reference}`)
      const data = await res.json()

      if (data.success) {
        clearCart()
        router.push(`/order-confirmation?reference=${reference}`)
      } else {
        alert('Payment verification failed. Please contact support.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Verification error:', err)
      alert('Payment verification failed. Please contact support.')
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout — ScentLumus</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h1>
            <Link href="/" className="text-amber-700 hover:underline">
              Return to shop
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout — ScentLumus</title>
      </Head>
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        onLoad={() => {
          console.log('Paystack script loaded')
          setPaystackLoaded(true)
        }}
        onError={(e) => {
          console.error('Paystack script failed to load:', e)
          setPaystackLoaded(false)
        }}
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-bold text-amber-900">
              ScentLumus
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{ borderColor: deliveryMethod === 'delivery' ? '#b45309' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="block font-medium text-gray-900">🚚 Home Delivery</span>
                      <span className="block text-sm text-gray-500">We'll deliver to your address</span>
                    </div>
                    <span className="font-semibold text-amber-700">
                      {formData.state && formData.city ? 
                        (deliveryFee > 0 ? `₦${deliveryFee.toLocaleString('en-NG')}` : 'FREE') : 
                        'Select address'
                      }
                    </span>
                  </label>

                  {selfPickupEnabled && (
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      style={{ borderColor: deliveryMethod === 'pickup' ? '#b45309' : '#d1d5db' }}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">📦 Self Pickup</span>
                        <span className="block text-sm text-gray-500">Pick up from our location</span>
                      </div>
                      <span className="font-semibold text-green-600">FREE</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Pickup Address Selection */}
              {deliveryMethod === 'pickup' && pickupAddresses.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Pickup Location</h2>
                  <div className="space-y-3">
                    {pickupAddresses.map(address => (
                      <label key={address.id} className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                        style={{ borderColor: selectedPickupAddress?.id === address.id ? '#b45309' : '#d1d5db' }}>
                        <input
                          type="radio"
                          name="pickupAddress"
                          value={address.id}
                          checked={selectedPickupAddress?.id === address.id}
                          onChange={() => setSelectedPickupAddress(address)}
                          className="w-4 h-4 text-amber-600 mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <span className="block font-medium text-gray-900">{address.name}</span>
                          <span className="block text-sm text-gray-600 mb-1">{address.address}</span>
                          <span className="block text-sm text-gray-600 mb-2">{address.city}, {address.state}</span>
                          {address.phone && <span className="block text-sm text-gray-600">📞 {address.phone}</span>}
                          {address.businessHours && <span className="block text-sm text-gray-600">🕒 {address.businessHours}</span>}
                          {address.instructions && <span className="block text-sm text-gray-600">📋 {address.instructions}</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                  {pickupAddresses.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No pickup locations available yet.</p>
                  )}
                </div>
              )}

              {/* Shipping Address */}
              {deliveryMethod === 'delivery' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        placeholder="Enter your street address"
                        required
                      />
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City/LGA *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        required
                        disabled={!formData.state}
                      >
                        <option value="">{formData.state ? 'Select City/LGA' : 'Select State First'}</option>
                        {formData.state && getLgasForState(formData.state).map(lga => (
                          <option key={lga} value={lga}>{lga}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        required
                      >
                        <option value="">Select State</option>
                        {NIGERIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Promo Code */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow p-6 border border-amber-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🎉 Have a Promo Code?</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-300 rounded px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="px-6 py-2 bg-amber-700 text-white rounded font-semibold hover:bg-amber-800 disabled:bg-gray-400"
                  >
                    {promoLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                
                {/* Applied Promos */}
                {appliedPromos.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h3 className="font-medium text-gray-800">Applied Promo Codes:</h3>
                    {appliedPromos.map((promo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-100 border-2 border-green-500 rounded-lg">
                        <div>
                          <p className="font-bold text-green-800">{promo.code}</p>
                          <p className="text-green-700 text-sm">Saved ₦{promo.discountAmount.toLocaleString('en-NG')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePromo(index)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="text-right font-semibold text-green-800">
                      Total Savings: ₦{appliedPromos.reduce((sum, p) => sum + p.discountAmount, 0).toLocaleString('en-NG')}
                    </div>
                  </div>
                )}
                
                {promoMessage && (
                  <p className={`mt-2 text-sm ${promoMessage.includes('saved') || promoMessage.includes('Applied') ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{ borderColor: formData.paymentMethod === 'paystack' ? '#b45309' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={formData.paymentMethod === 'paystack'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">💳 Pay with Card</div>
                      <div className="text-sm text-gray-500">Pay securely with Paystack</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{ borderColor: formData.paymentMethod === 'cash_on_delivery' ? '#b45309' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">💵 Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  <Link
                    href="/cart"
                    className="text-sm text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Cart
                  </Link>
                </div>
                
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded flex items-center justify-center text-xs">
                          {item.name.slice(0, 3)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-amber-900">
                          ₦{(parseFloat(item.price) * item.quantity).toLocaleString('en-NG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₦{getCartTotal().toLocaleString('en-NG')}</span>
                  </div>
                  {appliedPromos.map((promo, index) => (
                    <div key={index} className="flex justify-between text-green-600 font-medium">
                      <span>Promo Discount ({promo.code})</span>
                      <span>-₦{promo.discountAmount.toLocaleString('en-NG')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="flex flex-col items-end">
                      {appliedPromos.some(promo => promo.isFreeDelivery) ? (
                        <span className="text-green-600 font-semibold">FREE (Promo)</span>
                      ) : deliveryFee === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        <span>₦{deliveryFee.toLocaleString('en-NG')}</span>
                      )}
                      <span className="text-xs text-gray-500">{deliveryMessage}</span>
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₦{getDiscountedTotal().toLocaleString('en-NG')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : getDiscountedTotal() === 0 ? '🎉 Complete Free Order' : formData.paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order'}
                </button>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 mb-2">
                  <div className="flex flex-col items-center text-xs text-gray-600">
                    <svg className="w-8 h-8 mb-1 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span>100% Secure</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-gray-600">
                    <svg className="w-8 h-8 mb-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                    <span>Verified Payment</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-gray-600">
                    <svg className="w-8 h-8 mb-1 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                    <span>Money-back Guarantee</span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-gray-600">
                    <svg className="w-8 h-8 mb-1 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 7l10 6 10-6" /></svg>
                    <span>SSL Encrypted</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
