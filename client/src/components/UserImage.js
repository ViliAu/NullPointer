import { React, useState, useEffect } from 'react';

// Wrapper component for nice-looking user pictures
const UserImage = ({ user, size, className, includeName }) => {
    const [imgSrc, setImgSrc] = useState('/defaultusericon.png');

    // Get picture data
    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            if (user.admin) {
                setImgSrc('/admin.png');
                return;
            }
            if (!user.image || user.image === 'none') {
                return;
            }
            try {
                const res = await fetch('/api/image/' + user.image);
                const imgBlob = await res.blob();
                if (mounted) {
                    if (imgBlob && res.ok) {
                        setImgSrc(URL.createObjectURL(imgBlob));
                    }
                }
            }
            catch { }
        }
        fetchData();
        return () => {
            mounted = false;
        }
    }, [user]);

    return (
        <div>
            <img
                alt={user.name + ' image'}
                src={imgSrc}
                width={size}
                height={size}
                className={className}
                style={{borderRadius: '50%'}}
            />
            {includeName ? ' '+user.name : ''}
        </div>
    )
}

UserImage.defaultProps = {
    user: {
        name: 'defaultuser',
        admin: false,
        if: null
    },
    alt: '',
    size: 100,
    className: '',
    includeName: false
}

export default UserImage;
