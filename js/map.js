// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 初始化地图
    const map = L.map('map').setView([22.593099, 113.102171], 12); // 江门市中心坐标

    // 添加地图图层 - 使用国内稳定的高德地图瓦片服务

    // 创建高德地图图层（在国内访问更稳定）
    const amapLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        maxZoom: 19,
        tileSize: 256,
        zoomOffset: 0,
        subdomains: ['1', '2', '3', '4'] // 使用多个子域名进行负载均衡
    }).addTo(map); // 确保图层添加到地图上

    // 可选：添加高德地图图层作为备用（默认不启用）
    // const amapLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}', {
    //   subdomains: ['1','2','3','4'],
    //   attribution: '© 高德地图',
    //   maxZoom: 18
    // });

    // 创建自定义地图标记图标 - 改进结构和可维护性
    function createCustomMarkerIcon(color = 'primary', size = 'normal') {
        const iconSize = size === 'large' ? 32 : 24;
        const pulseSize = size === 'large' ? 8 : 6;
        return L.divIcon({
            className: 'custom-marker',
            html: `<div class="relative">
                    <div class="w-${pulseSize} h-${pulseSize} bg-${color} rounded-full flex items-center justify-center text-white font-bold marker-pulse">
                        <i class="fa fa-map-marker ${size === 'large' ? 'text-lg' : ''}"></i>
                    </div>
                    <div class="w-${pulseSize} h-${pulseSize} bg-${color}/30 rounded-full absolute top-0 left-0 animate-ping"></div>
                   </div>`,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize / 2, iconSize / 2]
        });
    }

    // 默认标记图标
    const customIcon = createCustomMarkerIcon('primary');
    // 选中状态的红色大图标
    const selectedIcon = createCustomMarkerIcon('red', 'large');
    
    // 当前选中的标记
    let selectedMarker = null;

    // 江门地区名人相关地点数据
    const locations = [
        {
            id: 1,
            name: '陈荣衮故居',
            description: '陈荣衮是晚清举人，光绪四年（1878年）中秀才，后在广州六榕寺附近设馆教学。他是我国提倡白话文的第一人，投身教育和编写妇孺课本，创办了多所学校，被誉为"东方之辈斯塔洛齐"（瑞士著名儿童教育实践家）。知名人士如冼玉清、陈德芸、利铭泽等均受业陈门。',
            coordinates: [22.583000, 113.091000],
            image: 'img/陈荣衮.jpg',
            category: '名人故居',
            rating: 4.6,
            address: '江门市蓬江区'
        },
        {
            id: 2,
            name: '陈少白故居',
            description: '陈少白是中国共产党党员，革命烈士。1943年从外地回到老家金子乡，与共产党员陈立洪等一起组织农会、三抗社和武工队，发动群众参加武装起义。1946年加入中国共产党，1947年任中共金子特支组织委员。1949年在重庆渣滓洞监狱的大屠杀中牺牲。',
            coordinates: [22.521000, 113.068000],
            image: 'img/陈少白.jpg',
            category: '名人故居',
            rating: 4.8,
            address: '江门市新会区'
        },
        {
            id: 3,
            name: '陈伯坛故居',
            description: '陈伯坛是清末举人，后专研中医，尤擅《伤寒论》，以六经气化学说阐释，重视阴阳理论，其观点对后学颇有启发。他在广州、香港行医期间，参与创办宏中医药专门学校，对近代岭南伤寒学发展贡献很大。',
            coordinates: [22.591000, 113.102000],
            image: 'img/陈伯坛.jpg',
            category: '名人故居',
            rating: 4.5,
            address: '江门市蓬江区'
        },
        {
            id: 4,
            name: '陈冠时烈士纪念地',
            description: '陈冠时是中国共产党党员，抗日英烈。1940年考入香港中国新闻学院并入党。1941年任东江抗日游击队宣传干事，香港沦陷后参加广东人民抗日游击队港九大队。1943年在掩护战友撤退时被俘牺牲，年仅21岁，后被追认为革命烈士。',
            coordinates: [22.590000, 113.095000],
            image: 'img/陈冠时.jpg',
            category: '名人纪念',
            rating: 4.9,
            address: '江门市蓬江区'
        },
        {
            id: 5,
            name: '陈吾德故居',
            description: '陈吾德生于明嘉靖十六年（1537年），自幼聪颖好学，师从名儒唐顺之。嘉靖三十八年（1559年）中进士，授翰林院编修。在朝为官期间，廉洁自守，不阿权贵，深得同僚敬佩。曾任国子监祭酒，提倡"教学相长"，注重培养学生的品德和才能。',
            coordinates: [22.520000, 113.060000],
            image: 'img/陈吾德.jpg',
            category: '名人故居',
            rating: 4.4,
            address: '江门市新会区'
        },
        {
            id: 6,
            name: '陈大英烈士纪念地',
            description: '陈大英是中国共产党党员，抗日英烈。1936年毕业于中山大学，同年加入中国共产党，并积极参与了广州的一二九运动。抗日战争爆发后，他积极组织抗日救亡活动, 1945年在惠阳新圩不幸中弹遇难，年仅34岁。',
            coordinates: [22.585000, 113.098000],
            image: 'https://picsum.photos/seed/cdy/600/400',
            category: '名人纪念',
            rating: 4.8,
            address: '江门市蓬江区'
        },
        {
            id: 7,
            name: '陈梦吉故居',
            description: '陈梦吉是清末广东民间第一状师，被誉为"扭计祖宗"。他足智多谋，以惩恶扬善、助百姓申冤而著称，共有300余篇故事在民间广泛流传。其经典案例包括破解迷信、整治贪官、为民伸冤等，被列入省级非物质文化遗产名录。',
            coordinates: [22.518000, 113.059000],
            image: 'img/陈梦吉.jpg',
            category: '名人故居',
            rating: 4.7,
            address: '江门市新会区'
        },
        {
            id: 8,
            name: '陈国泉纪念地',
            description: '陈国泉是中国银行浙江省分行国际金融研究所的高级经济师。1964年毕业于浙江大学，同年8月至1981年1月从事核武器总体理论设计和试验工作，参与了原子弹和氢弹的系列项目，获得了国家自然科学奖、国家科学技术进步奖等九项荣誉。',
            coordinates: [22.592000, 113.100000],
            image: 'https://picsum.photos/seed/cgq/600/400',
            category: '名人纪念',
            rating: 4.6,
            address: '江门市蓬江区'
        },
        {
            id: 9,
            name: '陈国强纪念地',
            description: '陈国强是中国科学院院士，海南医学院院长。他的研究领域主要为白血病和实体肿瘤，为攻克这些疑难疾病做出了重要贡献。因其杰出的学术成就获得了国家自然科学奖二等奖等荣誉，成为医学界的佼佼者。',
            coordinates: [22.590000, 113.105000],
            image: 'img/陈国强.jpg',
            category: '名人纪念',
            rating: 4.7,
            address: '江门市蓬江区'
        }
    ];

    // 防抖函数 - 提高性能，避免频繁触发
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 添加按钮点击动画效果 - 提取为可重用函数
    function addButtonAnimation(button, callback) {
        button.addEventListener('click', function () {
            // 添加点击动画效果
            this.classList.add('scale-95');
            setTimeout(() => {
                this.classList.remove('scale-95');
            }, 200);

            // 执行回调函数
            if (typeof callback === 'function') {
                callback();
            }
        });
    }

    // 用于存储地图标记的数组
    const markers = [];

    // 在地图上添加标记 - 优化遍历过程
    function addMarkersToMap() {
        locations.forEach(location => {
            const marker = L.marker(location.coordinates, {
                icon: customIcon,
                title: location.name // 添加标题属性，提高可访问性
            }).addTo(map);
            marker._id = location.id; // 为标记添加ID属性
            markers.push(marker);

            // 添加点击事件
            marker.on('click', function () {
                showLocationInfo(location);
                highlightMarker(location.id);
            });
        });
    }

    // 高亮显示选中的标记
    function highlightMarker(locationId) {
        // 恢复所有标记到默认状态
        markers.forEach(marker => {
            marker.setIcon(customIcon);
            marker.setZIndexOffset(0);
        });

        // 找到并高亮选中的标记
        const selectedMarker = markers.find(marker => marker._id === locationId);
        if (selectedMarker) {
            selectedMarker.setIcon(selectedIcon);
            selectedMarker.setZIndexOffset(1000);
        }
    }

    // 添加标记到地图
    addMarkersToMap();

    // 显示地点信息 - 优化性能并添加错误处理
    function showLocationInfo(location) {
        // 健壮性检查
        if (!location) {
            console.warn('无效的地点信息');
            return;
        }

        const infoContent = document.getElementById('info-content');
        if (!infoContent) return;

        // 创建信息内容
        const content = `
            <div class="scale-in">
                <img src="${location.image || 'https://picsum.photos/seed/default/600/400'}" alt="${location.name}" class="w-full h-48 object-cover rounded-lg mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-xl font-bold text-dark">${location.name}</h4>
                    <div class="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md">
                        <i class="fa fa-star mr-1"></i>
                        <span>${location.rating}</span>
                    </div>
                </div>
                <div class="flex items-center text-sm text-gray-500 mb-4">
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-2">${location.category}</span>
                    <span class="flex items-center"><i class="fa fa-map-marker mr-1"></i>${location.address}</span>
                </div>
                <p class="text-gray-700 leading-relaxed mb-6">${location.description}</p>
                <div class="flex space-x-3">
                    <button class="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 get-directions-btn" data-lat="${location.coordinates[0]}" data-lng="${location.coordinates[1]}" data-name="${location.name}">
                        <i class="fa fa-directions"></i>
                        <span>获取路线</span>
                    </button>
                    <button class="flex-1 bg-white hover:bg-gray-50 text-primary border border-primary py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 favorite-btn" data-id="${location.id}">
                        <i class="fa fa-heart-o"></i>
                        <span>收藏</span>
                    </button>
                </div>
            </div>
        `;

        // 更新信息面板内容
        infoContent.innerHTML = content;

        // 强制重排后添加动画效果，确保动画可靠触发
        void infoContent.offsetWidth;

        infoContent.classList.add('opacity-100');
        infoContent.classList.remove('opacity-0');

        // 在移动设备上，如果信息面板在地图下方，则滚动到信息面板
        if (window.innerWidth < 1024) {
            debounce(() => {
                document.getElementById('location-info')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100)();
        }
    }

    // 生成热门景点卡片 - 只显示前3个热门景点
    function generatePopularSpots() {
        const popularSpotsContainer = document.getElementById('popular-spots');
        if (!popularSpotsContainer) return;

        // 过滤出所有名人故居类别的景点，并只取前3个
        const popularLocations = locations.filter(location => 
            location.category === '名人故居'
        ).slice(0, 3);

        // 一次性创建所有卡片的HTML内容，减少DOM操作
        let cardsHTML = '';
        popularLocations.forEach(location => {
            cardsHTML += `
                <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div class="relative">
                        <img src="${location.image || 'https://picsum.photos/seed/default/600/400'}" alt="${location.name}" class="w-full h-48 object-cover">
                        <div class="absolute top-3 right-3 bg-primary text-white text-sm px-2 py-1 rounded-full">
                            ${location.category}
                        </div>
                    </div>
                    <div class="p-5">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="text-lg font-bold text-dark">${location.name}</h4>
                            <div class="flex items-center text-primary">
                                <i class="fa fa-star mr-1"></i>
                                <span>${location.rating}</span>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-2">${location.description}</p>
                        <button class="popular-spot-btn w-full bg-white hover:bg-gray-50 text-primary border border-primary py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2" data-id="${location.id}">
                            <i class="fa fa-map-o"></i>
                            <span>在地图上查看</span>
                        </button>
                    </div>
                </div>
            `;
        });

        // 一次性添加所有卡片到DOM
        popularSpotsContainer.innerHTML = cardsHTML;

        // 使用事件委托添加点击事件，提高性能
        popularSpotsContainer.addEventListener('click', function (e) {
            const button = e.target.closest('.popular-spot-btn');
            if (!button) return;

            const locationId = parseInt(button.getAttribute('data-id'));
            const selectedLocation = locations.find(loc => loc.id === locationId);

            if (selectedLocation) {
                // 显示地点信息
                showLocationInfo(selectedLocation);

                // 地图定位到所选地点
                map.setView(selectedLocation.coordinates, 14);

                // 高亮显示选中的标记
                highlightMarker(locationId);

                // 滚动到地图区域
                debounce(() => {
                    document.querySelector('#map')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100)();
            }
        });
    }

    // 生成热门景点
    generatePopularSpots();

    // 移动端菜单切换
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    }

    // 地图控制按钮事件 - 使用函数替换重复代码
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetMapBtn = document.getElementById('reset-map');
    const locateJmBtn = document.getElementById('locate-jm');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function () {
            map.zoomIn();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function () {
            map.zoomOut();
        });
    }

    if (resetMapBtn) {
        resetMapBtn.addEventListener('click', function () {
            map.setView([22.593099, 113.102171], 12); // 重置到江门市中心
        });
    }

    // 定位江门按钮 - 使用addButtonAnimation函数
    if (locateJmBtn) {
        addButtonAnimation(locateJmBtn, function () {
            map.setView([22.593099, 113.102171], 12);
        });
    }

    // 监听窗口滚动事件，改变导航栏样式 - 添加防抖优化
    window.addEventListener('scroll', debounce(function () {
        const header = document.querySelector('header');
        if (!header) return;

        if (window.scrollY > 50) {
            header.classList.add('shadow-md', 'py-2');
            header.classList.remove('py-4');
        } else {
            header.classList.remove('shadow-md', 'py-2');
            header.classList.add('py-4');
        }
    }, 100));

    // 添加事件委托处理功能按钮点击
    document.addEventListener('click', function(e) {
        // 处理获取路线按钮
        if (e.target.closest('.get-directions-btn')) {
            const button = e.target.closest('.get-directions-btn');
            const lat = button.getAttribute('data-lat');
            const lng = button.getAttribute('data-lng');
            const name = button.getAttribute('data-name');
            
            // 使用高德地图打开路线规划
            const url = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}&src=web&callnative=1`;
            window.open(url, '_blank');
        }

        // 处理收藏按钮
        if (e.target.closest('.favorite-btn')) {
            const button = e.target.closest('.favorite-btn');
            const locationId = button.getAttribute('data-id');
            
            // 切换收藏状态
            toggleFavorite(locationId, button);
        }
    });

    // 收藏功能
    function toggleFavorite(locationId, button) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(locationId);
        
        if (index === -1) {
            // 添加到收藏
            favorites.push(locationId);
            button.innerHTML = '<i class="fa fa-heart"></i><span>已收藏</span>';
            button.classList.add('bg-primary', 'text-white');
            button.classList.remove('bg-white', 'text-primary', 'border-primary');
        } else {
            // 从收藏移除
            favorites.splice(index, 1);
            button.innerHTML = '<i class="fa fa-heart-o"></i><span>收藏</span>';
            button.classList.remove('bg-primary', 'text-white');
            button.classList.add('bg-white', 'text-primary', 'border-primary');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // 初始化收藏状态
    function initFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        document.querySelectorAll('.favorite-btn').forEach(button => {
            const locationId = button.getAttribute('data-id');
            if (favorites.includes(locationId)) {
                button.innerHTML = '<i class="fa fa-heart"></i><span>已收藏</span>';
                button.classList.add('bg-primary', 'text-white');
                button.classList.remove('bg-white', 'text-primary', 'border-primary');
            }
        });
    }

    // 在显示地点信息后初始化收藏状态
    const originalShowLocationInfo = showLocationInfo;
    showLocationInfo = function(location) {
        originalShowLocationInfo(location);
        // 延迟执行以确保DOM已更新
        setTimeout(initFavorites, 100);
    };

    // 处理URL参数 - 从所有景点页面跳转时高亮对应标记
    function handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const locationId = urlParams.get('location');
        
        if (locationId) {
            const locationIdNum = parseInt(locationId);
            const selectedLocation = locations.find(loc => loc.id === locationIdNum);
            
            if (selectedLocation) {
                // 地图定位到所选地点
                map.setView(selectedLocation.coordinates, 14);
                
                // 高亮显示选中的标记
                highlightMarker(locationIdNum);
                
                // 显示地点信息
                showLocationInfo(selectedLocation);
                
                // 滚动到地图区域
                debounce(() => {
                    document.querySelector('#map')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100)();
            }
        }
    }

    // 页面加载完成后处理URL参数
    handleUrlParameters();
});
